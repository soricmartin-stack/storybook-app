import { useState, useCallback } from 'react';
import { translateText, SUPPORTED_LANGUAGES, Language } from '../config/openai';
import { useStorybook } from './useStorybook';
import { StorybookPage } from '../types';

export function useTranslation(storybookId?: string) {
  const [translating, setTranslating] = useState(false);
  const [translatingPage, setTranslatingPage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updatePage, pages } = useStorybook(storybookId);

  // Translate a single text
  const translateSingleText = useCallback(async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    setTranslating(true);
    setError(null);
    try {
      const translated = await translateText(text, targetLanguage);
      return translated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setTranslating(false);
    }
  }, []);

  // Translate a page
  const translatePage = useCallback(async (
    pageId: string,
    targetLanguage: string
  ) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) {
      setError('Page not found');
      return null;
    }

    setTranslatingPage(pageId);
    setError(null);

    try {
      // Translate the main text
      const translatedText = await translateText(page.text, targetLanguage);

      // Update page with translation
      await updatePage(pageId, {
        translations: {
          ...page.translations,
          [targetLanguage]: translatedText,
        },
      });

      return translatedText;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setTranslatingPage(null);
    }
  }, [pages, updatePage]);

  // Translate all pages in a storybook
  const translateAllPages = useCallback(async (
    targetLanguage: string
  ): Promise<boolean> => {
    if (!pages || pages.length === 0) return false;

    setTranslating(true);
    setError(null);

    try {
      for (const page of pages) {
        // Check if translation already exists
        if (!page.translations?.[targetLanguage]) {
          await translatePage(page.id, targetLanguage);
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setTranslating(false);
      setTranslatingPage(null);
    }
  }, [pages, translatePage]);

  // Get translation for a page in specific language
  const getPageTranslation = useCallback((
    page: StorybookPage,
    language: string
  ): string => {
    if (language === 'en' || !language) return page.text;
    return page.translations?.[language] || page.text;
  }, []);

  // Get available translations for a page
  const getAvailableTranslations = useCallback((
    page: StorybookPage
  ): string[] => {
    return Object.keys(page.translations || {}).filter(lang => lang !== 'en');
  }, []);

  return {
    translating,
    translatingPage,
    error,
    languages: SUPPORTED_LANGUAGES,
    translateSingleText,
    translatePage,
    translateAllPages,
    getPageTranslation,
    getAvailableTranslations,
    setError,
  };
}
