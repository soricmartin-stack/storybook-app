// Colors
export const COLORS = {
  // Primary palette
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary palette
  secondary: '#FCD34D',
  secondaryLight: '#FDE68A',
  secondaryDark: '#F59E0B',
  
  // Accent
  accent: '#EC4899',
  accentLight: '#F472B6',
  accentDark: '#DB2777',
  
  // Backgrounds
  background: '#F9FAFB',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#1F2937',
  
  // Surface
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  surfaceDark: '#374151',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Borders
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Animation
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    linear: 'linear',
  },
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// Limits
export const LIMITS = {
  titleLength: 100,
  pageTextLength: 1000,
  descriptionLength: 500,
  maxPages: 50,
  maxStorybooks: 1000,
  imageMaxSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
};

// Firebase Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  STORYBOOKS: 'storybooks',
  PAGES: 'pages',
};

// Storage Paths
export const STORAGE_PATHS = {
  COVERS: 'covers',
  PAGES: 'pages',
  AVATARS: 'avatars',
};

// Default Languages
export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';
