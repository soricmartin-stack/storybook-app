import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { speak, stopSpeaking, isSpeakingAsync } from 'expo-speech';
import { useStorybook, usePages } from '../../hooks/useStorybook';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SUPPORTED_LANGUAGES, Language } from '../../config/openai';
import { StorybookPage } from '../../types';

const { width, height } = Dimensions.get('window');

export default function BookReader() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { storybook, fetchStorybook, loading: bookLoading } = useStorybook();
  const { pages, fetchPages } = usePages(id as string);
  const { 
    translating, 
    translatingPage, 
    languages, 
    translatePage, 
    getPageTranslation 
  } = useTranslation(id as string);

  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isReading, setIsReading] = useState(false);
  const [showTranslationMenu, setShowTranslationMenu] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      fetchStorybook(id as string);
      fetchPages();
    }
  }, [id]);

  useEffect(() => {
    if (storybook) {
      setSelectedLanguage('en');
    }
  }, [storybook]);

  const handlePageChange = (event: any) => {
    const newPage = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(newPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      flatListRef.current?.scrollToIndex({ index: newPage, animated: true });
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      flatListRef.current?.scrollToIndex({ index: newPage, animated: true });
    }
  };

  const handleTranslate = async (languageCode: string) => {
    const currentPageData = pages[currentPage];
    if (currentPageData) {
      await translatePage(currentPageData.id, languageCode);
      setSelectedLanguage(languageCode);
      setShowTranslationMenu(false);
    }
  };

  const handleReadAloud = async () => {
    const pageText = getPageTranslation(pages[currentPage], selectedLanguage);
    
    if (isReading) {
      await stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      await speak(pageText, {
        pitch: 1.0,
        rate: 1.0,
        onDone: () => setIsReading(false),
        onError: () => setIsReading(false),
      });
    }
  };

  const renderPage = ({ item, index }: { item: StorybookPage; index: number }) => {
    const translatedText = getPageTranslation(item, selectedLanguage);
    const isCurrentPage = index === currentPage;

    return (
      <View style={styles.pageContainer}>
        <View style={styles.pageImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.pageImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.pageTextContainer}>
          <Text style={styles.pageText}>
            {translatedText}
          </Text>
          
          {/* Translation indicator */}
          {selectedLanguage !== 'en' && (
            <View style={styles.translationBadge}>
              <Text style={styles.translationBadgeText}>
                {languages.find(l => l.code === selectedLanguage)?.nativeName}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (bookLoading || pages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading storybook...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {storybook?.title}
          </Text>
          
          <TouchableOpacity 
            style={styles.translateButton}
            onPress={() => setShowTranslationMenu(true)}
          >
            <Text style={styles.translateButtonText}>🌍</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Page Viewer */}
      <Pressable 
        style={styles.viewer}
        onPress={() => setShowControls(!showControls)}
      >
        <FlatList
          ref={flatListRef}
          data={pages}
          renderItem={renderPage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handlePageChange}
          initialScrollIndex={currentPage}
          getItemLayout={(item, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </Pressable>

      {/* Bottom Controls */}
      {showControls && (
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
            onPress={handlePrevPage}
            disabled={currentPage === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <Text style={styles.pageIndicator}>
            {currentPage + 1} / {pages.length}
          </Text>

          <TouchableOpacity 
            style={[styles.navButton, currentPage === pages.length - 1 && styles.navButtonDisabled]}
            onPress={handleNextPage}
            disabled={currentPage === pages.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reading Controls */}
      {showControls && (
        <View style={styles.readingControls}>
          <TouchableOpacity 
            style={styles.readButton}
            onPress={handleReadAloud}
          >
            <Text style={styles.readButtonIcon}>{isReading ? '⏹️' : '🔊'}</Text>
            <Text style={styles.readButtonText}>
              {isReading ? 'Stop' : 'Read Aloud'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Translation Menu Modal */}
      <Modal
        visible={showTranslationMenu}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTranslationMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTranslationMenu(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Translate Page</Text>
            <Text style={styles.modalSubtitle}>
              Current language: {languages.find(l => l.code === selectedLanguage)?.name}
            </Text>

            <View style={styles.languageGrid}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.code && styles.languageOptionActive,
                    translatingPage && styles.languageOptionDisabled,
                  ]}
                  onPress={() => lang.code !== 'en' && handleTranslate(lang.code)}
                  disabled={translating || lang.code === 'en'}
                >
                  <Text style={styles.languageFlag}>
                    {lang.code === 'en' ? '🇺🇸' : 
                     lang.code === 'es' ? '🇪🇸' : 
                     lang.code === 'fr' ? '🇫🇷' : 
                     lang.code === 'de' ? '🇩🇪' : 
                     lang.code === 'it' ? '🇮🇹' : 
                     lang.code === 'pt' ? '🇧🇷' : 
                     lang.code === 'zh' ? '🇨🇳' : 
                     lang.code === 'ja' ? '🇯🇵' : 
                     lang.code === 'ko' ? '🇰🇷' : 
                     lang.code === 'ru' ? '🇷🇺' : 
                     lang.code === 'ar' ? '🇸🇦' : 
                     lang.code === 'hi' ? '🇮🇳' : '🌍'}
                  </Text>
                  <Text 
                    style={[
                      styles.languageName,
                      selectedLanguage === lang.code && styles.languageNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {lang.nativeName}
                  </Text>
                  {selectedLanguage === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Close"
              variant="outline"
              onPress={() => setShowTranslationMenu(false)}
              style={styles.closeButton}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  translateButton: {
    padding: SPACING.sm,
  },
  translateButtonText: {
    fontSize: 24,
  },
  viewer: {
    flex: 1,
  },
  pageContainer: {
    width: width,
    height: height - 200,
    padding: SPACING.md,
  },
  pageImageContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },
  pageTextContainer: {
    minHeight: 80,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  pageText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  translationBadge: {
    position: 'absolute',
    top: -8,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  translationBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  readingControls: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.md,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.large,
  },
  readButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  readButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  languageOption: {
    width: '30%',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  languageOptionDisabled: {
    opacity: 0.5,
  },
  languageFlag: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  languageName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  languageNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

const SHADOWS = {
  large: {
    shadowColor: COLORS.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
