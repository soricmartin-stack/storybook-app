// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  storybookCount: number;
}

// Storybook types
export interface Storybook {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImage?: string;
  pages: StorybookPage[];
  pageCount: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  readCount: number;
}

export interface StorybookPage {
  id: string;
  storybookId: string;
  order: number;
  imageUrl: string;
  text: string;
  translations: Record<string, string>;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Translation types
export interface Translation {
  languageCode: string;
  translatedText: string;
}

// Library types
export interface LibraryFilters {
  searchQuery: string;
  sortBy: 'recent' | 'title' | 'popular';
  language?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  displayName?: string;
}

// Editor types
export interface EditorState {
  storybook: Partial<Storybook> | null;
  currentPageIndex: number;
  isDirty: boolean;
  isSaving: boolean;
}

export interface PageEditorData {
  imageUrl?: string;
  text: string;
  translations: Record<string, string>;
}

// Reader types
export interface ReaderSettings {
  autoRead: boolean;
  readSpeed: number;
  showTranslations: boolean;
  currentLanguage: string;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Tabs: undefined;
  Home: undefined;
  Library: undefined;
  Settings: undefined;
  BookCreate: undefined;
  BookEdit: { storybookId: string };
  BookRead: { storybookId: string };
  BookView: { storybookId: string };
};

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Create: undefined;
  Settings: undefined;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Storage types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
