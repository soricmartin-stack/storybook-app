import { useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Storybook, StorybookPage, PaginationState, LibraryFilters } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ITEMS_PER_PAGE = 20;

export function useStorybook() {
  const [storybook, setStorybook] = useState<Storybook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single storybook
  const fetchStorybook = useCallback(async (storybookId: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'storybooks', storybookId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStorybook({ id: docSnap.id, ...data } as Storybook);
        return { id: docSnap.id, ...data } as Storybook;
      } else {
        setError('Storybook not found');
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new storybook
  const createStorybook = useCallback(async (
    userId: string, 
    title: string,
    coverImage?: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const storybookId = uuidv4();
      const storybookData: Omit<Storybook, 'id'> = {
        userId,
        title,
        pages: [],
        pageCount: 0,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
        readCount: 0,
      };

      await setDoc(doc(db, 'storybooks', storybookId), {
        ...storybookData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update user's storybook count
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        storybookCount: arrayUnion(storybookId),
      });

      return storybookId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update storybook metadata
  const updateStorybook = useCallback(async (
    storybookId: string, 
    data: Partial<Storybook>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'storybooks', storybookId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a storybook
  const deleteStorybook = useCallback(async (storybookId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Delete all page images from storage
      const storybook = await fetchStorybook(storybookId);
      if (storybook) {
        for (const page of storybook.pages) {
          if (page.imageUrl) {
            try {
              const imageRef = ref(storage, page.imageUrl);
              await deleteObject(imageRef);
            } catch (e) {
              console.warn('Could not delete image:', page.imageUrl);
            }
          }
        }
        // Delete cover image
        if (storybook.coverImage) {
          try {
            const coverRef = ref(storage, storybook.coverImage);
            await deleteObject(coverRef);
          } catch (e) {
            console.warn('Could not delete cover image');
          }
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'storybooks', storybookId));

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchStorybook]);

  return {
    storybook,
    loading,
    error,
    fetchStorybook,
    createStorybook,
    updateStorybook,
    deleteStorybook,
    setStorybook,
  };
}

export function useLibrary(userId?: string) {
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    limit: ITEMS_PER_PAGE,
    hasMore: true,
    loading: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetchLibrary = useCallback(async (filters?: LibraryFilters) => {
    if (!userId) return;
    
    setPagination(prev => ({ ...prev, loading: true }));
    setError(null);

    try {
      const storybooksRef = collection(db, 'storybooks');
      let q = query(
        storybooksRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(ITEMS_PER_PAGE + 1)
      );

      if (filters?.searchQuery) {
        // For simple search, we'd need to consider Firestore limitations
        // This is a basic implementation
      }

      const snapshot = await getDocs(q);
      const newStorybooks: Storybook[] = [];
      
      snapshot.docs.slice(0, ITEMS_PER_PAGE).forEach(doc => {
        newStorybooks.push({ id: doc.id, ...doc.data() } as Storybook);
      });

      const hasMore = snapshot.docs.length > ITEMS_PER_PAGE;
      const lastDocSnapshot = snapshot.docs[ITEMS_PER_PAGE - 1];

      setStorybooks(newStorybooks);
      setLastDoc(lastDocSnapshot || null);
      setPagination({
        page: 1,
        limit: ITEMS_PER_PAGE,
        hasMore,
        loading: false,
      });
    } catch (err: any) {
      setError(err.message);
      setPagination(prev => ({ ...prev, loading: false }));
    }
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || !lastDoc || !pagination.hasMore || pagination.loading) return;

    setPagination(prev => ({ ...prev, loading: true }));

    try {
      const storybooksRef = collection(db, 'storybooks');
      const q = query(
        storybooksRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE + 1)
      );

      const snapshot = await getDocs(q);
      const newStorybooks: Storybook[] = [];
      
      snapshot.docs.slice(0, ITEMS_PER_PAGE).forEach(doc => {
        newStorybooks.push({ id: doc.id, ...doc.data() } as Storybook);
      });

      const hasMore = snapshot.docs.length > ITEMS_PER_PAGE;
      const newLastDoc = snapshot.docs[ITEMS_PER_PAGE - 1];

      setStorybooks(prev => [...prev, ...newStorybooks]);
      setLastDoc(newLastDoc || null);
      setPagination(prev => ({
        ...prev,
        page: prev.page + 1,
        hasMore,
        loading: false,
      }));
    } catch (err: any) {
      setError(err.message);
      setPagination(prev => ({ ...prev, loading: false }));
    }
  }, [userId, lastDoc, pagination.hasMore, pagination.loading]);

  const refresh = useCallback(() => {
    setStorybooks([]);
    setLastDoc(null);
    setPagination({
      page: 0,
      limit: ITEMS_PER_PAGE,
      hasMore: true,
      loading: false,
    });
    fetchLibrary();
  }, [fetchLibrary]);

  return {
    storybooks,
    loading: pagination.loading,
    hasMore: pagination.hasMore,
    error,
    fetchLibrary,
    loadMore,
    refresh,
  };
}

export function usePages(storybookId?: string) {
  const [pages, setPages] = useState<StorybookPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    if (!storybookId) return;
    
    setLoading(true);
    try {
      const storybook = await getDoc(doc(db, 'storybooks', storybookId));
      if (storybook.exists()) {
        const data = storybook.data();
        setPages((data.pages || []).sort((a: StorybookPage, b: StorybookPage) => a.order - b.order));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [storybookId]);

  const addPage = useCallback(async (
    imageUrl: string, 
    text: string, 
    order: number
  ): Promise<string | null> => {
    if (!storybookId) return null;
    
    setLoading(true);
    try {
      const pageId = uuidv4();
      const newPage: StorybookPage = {
        id: pageId,
        storybookId,
        order,
        imageUrl,
        text,
        translations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const storybookRef = doc(db, 'storybooks', storybookId);
      const storybook = await getDoc(storybookRef);
      
      if (storybook.exists()) {
        const data = storybook.data();
        const updatedPages = [...(data.pages || []), newPage];
        
        await updateDoc(storybookRef, {
          pages: updatedPages,
          pageCount: updatedPages.length,
          updatedAt: serverTimestamp(),
        });

        setPages(prev => [...prev, newPage]);
        return pageId;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [storybookId]);

  const updatePage = useCallback(async (
    pageId: string, 
    data: Partial<StorybookPage>
  ) => {
    if (!storybookId) return false;
    
    setLoading(true);
    try {
      const storybookRef = doc(db, 'storybooks', storybookId);
      const storybook = await getDoc(storybookRef);
      
      if (storybook.exists()) {
        const storybookData = storybook.data();
        const updatedPages = (storybookData.pages || []).map((page: StorybookPage) => 
          page.id === pageId ? { ...page, ...data, updatedAt: new Date() } : page
        );
        
        await updateDoc(storybookRef, {
          pages: updatedPages,
          updatedAt: serverTimestamp(),
        });

        setPages(prev => prev.map(page => 
          page.id === pageId ? { ...page, ...data } : page
        ));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storybookId]);

  const deletePage = useCallback(async (pageId: string) => {
    if (!storybookId) return false;
    
    setLoading(true);
    try {
      const storybookRef = doc(db, 'storybooks', storybookId);
      const storybook = await getDoc(storybookRef);
      
      if (storybook.exists()) {
        const storybookData = storybook.data();
        const pageToDelete = (storybookData.pages || []).find((p: StorybookPage) => p.id === pageId);
        
        // Delete image from storage
        if (pageToDelete?.imageUrl) {
          try {
            const imageRef = ref(storage, pageToDelete.imageUrl);
            await deleteObject(imageRef);
          } catch (e) {
            console.warn('Could not delete page image');
          }
        }

        const updatedPages = (storybookData.pages || [])
          .filter((page: StorybookPage) => page.id !== pageId)
          .map((page: StorybookPage, index: number) => ({ ...page, order: index }));
        
        await updateDoc(storybookRef, {
          pages: updatedPages,
          pageCount: updatedPages.length,
          updatedAt: serverTimestamp(),
        });

        setPages(prev => prev.filter(page => page.id !== pageId).map((p, i) => ({ ...p, order: i })));
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storybookId]);

  const reorderPages = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!storybookId) return false;
    
    setLoading(true);
    try {
      const storybookRef = doc(db, 'storybooks', storybookId);
      const storybook = await getDoc(storybookRef);
      
      if (storybook.exists()) {
        const storybookData = storybook.data();
        const updatedPages = [...(storybookData.pages || [])];
        const [removed] = updatedPages.splice(fromIndex, 1);
        updatedPages.splice(toIndex, 0, removed);
        
        // Update order
        const reorderedPages = updatedPages.map((page: StorybookPage, index: number) => ({
          ...page,
          order: index,
        }));

        await updateDoc(storybookRef, {
          pages: reorderedPages,
          updatedAt: serverTimestamp(),
        });

        setPages(reorderedPages);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [storybookId]);

  return {
    pages,
    loading,
    error,
    fetchPages,
    addPage,
    updatePage,
    deletePage,
    reorderPages,
    setPages,
  };
}
