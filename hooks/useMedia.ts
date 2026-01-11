import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { UploadProgress } from '../types';

export function useMedia() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Request media permissions
  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      setError('Camera and media library permissions are required');
      return false;
    }
    return true;
  }, []);

  // Pick image from gallery
  const pickImage = useCallback(async (options?: ImagePicker.ImagePickerOptions): Promise<string | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [requestPermissions]);

  // Take photo with camera
  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [requestPermissions]);

  // Upload image to Firebase Storage
  const uploadImage = useCallback(async (
    uri: string,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string | null> => {
    setUploading(true);
    setUploadProgress({ loaded: 0, total: 100, percentage: 0 });
    setError(null);

    try {
      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename
      const filename = `${uuidv4()}.jpg`;
      const storagePath = `${path}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Upload with metadata
      const metadata = {
        contentType: 'image/jpeg',
        cacheControl: 'max-age=31536000',
      };

      // Upload snapshot
      const uploadTask = uploadBytes(storageRef, blob, metadata);

      uploadTask.then(async (snapshot) => {
        setUploadProgress({
          loaded: snapshot.bytesTransferred,
          total: snapshot.totalBytes,
          percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        setUploading(false);
        setUploadProgress(null);
        return downloadURL;
      });

      // For larger files, we could use uploadBytesResumable with progress tracking
      const snapshot = await uploadBytes(storageRef, blob, metadata);
      
      setUploadProgress({
        loaded: snapshot.bytesTransferred,
        total: snapshot.totalBytes,
        percentage: 100,
      });

      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploading(false);
      setUploadProgress(null);
      
      return downloadURL;
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
      setUploadProgress(null);
      return null;
    }
  }, []);

  // Upload storybook cover image
  const uploadCoverImage = useCallback(async (uri: string, storybookId: string): Promise<string | null> => {
    return uploadImage(uri, `storybooks/${storybookId}/covers`);
  }, [uploadImage]);

  // Upload storybook page image
  const uploadPageImage = useCallback(async (uri: string, storybookId: string): Promise<string | null> => {
    return uploadImage(uri, `storybooks/${storybookId}/pages`);
  }, [uploadImage]);

  // Delete image from storage
  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      const imageRef = ref(storage, url);
      await import('firebase/storage').then(({ deleteObject }) => deleteObject(imageRef));
      return true;
    } catch (err: any) {
      // Image might not exist or be deleted already
      console.warn('Could not delete image:', err.message);
      return true;
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    pickImage,
    takePhoto,
    uploadImage,
    uploadCoverImage,
    uploadPageImage,
    deleteImage,
    requestPermissions,
    setError,
  };
}
