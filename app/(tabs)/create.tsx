import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useStorybook, usePages } from '../../hooks/useStorybook';
import { useMedia } from '../../hooks/useMedia';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, LIMITS } from '../../constants';

interface PageData {
  imageUrl: string;
  text: string;
}

export default function CreateBook() {
  const router = useRouter();
  const { user } = useAuth();
  const { createStorybook, loading: bookLoading } = useStorybook();
  const { addPage, loading: pageLoading } = usePages();
  const { pickImage, takePhoto, uploading, uploadCoverImage, uploadPageImage } = useMedia();

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [step, setStep] = useState<'title' | 'cover' | 'pages'>('title');

  const handlePickCover = async () => {
    const uri = await pickImage({ aspect: [1, 1] });
    if (uri) {
      setCoverImage(uri);
      setStep('pages');
    }
  };

  const handleAddPage = async () => {
    const uri = await pickImage({ aspect: [4, 3] });
    if (uri) {
      setPages([...pages, { imageUrl: uri, text: '' }]);
    }
  };

  const handleRemovePage = (index: number) => {
    Alert.alert(
      'Remove Page',
      'Are you sure you want to remove this page?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const newPages = pages.filter((_, i) => i !== index);
            setPages(newPages);
          }
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to create storybooks');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your storybook');
      return;
    }

    if (pages.length === 0) {
      Alert.alert('Error', 'Please add at least one page to your storybook');
      return;
    }

    try {
      // Create storybook
      const storybookId = await createStorybook(user.id, title.trim(), coverImage || undefined);
      
      if (!storybookId) {
        throw new Error('Failed to create storybook');
      }

      // Upload cover image if exists
      if (coverImage) {
        const coverUrl = await uploadCoverImage(coverImage, storybookId);
        if (coverUrl) {
          // Update storybook with cover URL
        }
      }

      // Add pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Upload page image
        let imageUrl = '';
        if (page.imageUrl) {
          imageUrl = await uploadPageImage(page.imageUrl, storybookId);
        }

        await addPage(imageUrl, page.text, i);
      }

      Alert.alert(
        'Success!',
        'Your storybook has been created successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create storybook');
    }
  };

  const isLoading = bookLoading || pageLoading || uploading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Storybook</Text>
        
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={[styles.step, step === 'title' && styles.stepActive]}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepLabel}>Title</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, step !== 'title' && styles.stepActive]}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepLabel}>Cover</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, step === 'pages' && styles.stepActive]}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepLabel}>Pages</Text>
          </View>
        </View>

        {/* Step 1: Title */}
        {step === 'title' && (
          <View style={styles.stepContent}>
            <Input
              label="Storybook Title"
              placeholder="Enter a magical title..."
              value={title}
              onChangeText={setTitle}
              maxLength={LIMITS.titleLength}
            />
            <Button
              title="Continue"
              onPress={() => setStep('cover')}
              disabled={!title.trim()}
            />
          </View>
        )}

        {/* Step 2: Cover */}
        {step === 'cover' && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Add a Cover Image</Text>
            <Text style={styles.sectionSubtitle}>
              This will be the thumbnail for your storybook
            </Text>
            
            {coverImage ? (
              <View style={styles.coverPreview}>
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
                <TouchableOpacity 
                  style={styles.changeCoverButton}
                  onPress={handlePickCover}
                >
                  <Text style={styles.changeCoverText}>Change Cover</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageOptions}>
                <TouchableOpacity style={styles.imageOption} onPress={handlePickCover}>
                  <Text style={styles.imageOptionIcon}>🖼️</Text>
                  <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageOption} onPress={handlePickCover}>
                  <Text style={styles.imageOptionIcon}>📷</Text>
                  <Text style={styles.imageOptionText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <Button
                title="Back"
                variant="outline"
                onPress={() => setStep('title')}
              />
              <Button
                title="Continue"
                onPress={() => setStep('pages')}
                disabled={!coverImage}
              />
            </View>
          </View>
        )}

        {/* Step 3: Pages */}
        {step === 'pages' && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Add Pages</Text>
            <Text style={styles.sectionSubtitle}>
              Add images and text to create your story ({pages.length} pages)
            </Text>

            {/* Existing Pages */}
            <View style={styles.pagesList}>
              {pages.map((page, index) => (
                <View key={index} style={styles.pageItem}>
                  <Image source={{ uri: page.imageUrl }} style={styles.pageThumbnail} />
                  <View style={styles.pageInfo}>
                    <Text style={styles.pageNumber}>Page {index + 1}</Text>
                    <TextInput
                      style={styles.pageTextInput}
                      placeholder="Add text for this page..."
                      value={page.text}
                      onChangeText={(text) => {
                        const newPages = [...pages];
                        newPages[index].text = text;
                        setPages(newPages);
                      }}
                      multiline
                      maxLength={LIMITS.pageTextLength}
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.removePageButton}
                    onPress={() => handleRemovePage(index)}
                  >
                    <Text style={styles.removePageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Add Page Button */}
            <TouchableOpacity style={styles.addPageButton} onPress={handleAddPage}>
              <Text style={styles.addPageIcon}>+</Text>
              <Text style={styles.addPageText}>Add Another Page</Text>
            </TouchableOpacity>

            <View style={styles.navigationButtons}>
              <Button
                title="Back"
                variant="outline"
                onPress={() => setStep('cover')}
              />
              <Button
                title={isLoading ? 'Saving...' : 'Save Storybook'}
                onPress={handleSave}
                disabled={isLoading || pages.length === 0}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  step: {
    alignItems: 'center',
  },
  stepActive: {
    opacity: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  stepContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  imageOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  imageOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  imageOptionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  imageOptionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  coverPreview: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  changeCoverButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
  },
  changeCoverText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pagesList: {
    marginBottom: SPACING.lg,
  },
  pageItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  pageThumbnail: {
    width: 80,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  pageInfo: {
    flex: 1,
  },
  pageNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  pageTextInput: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    minHeight: 40,
    padding: 0,
  },
  removePageButton: {
    padding: SPACING.xs,
  },
  removePageText: {
    fontSize: 16,
    color: COLORS.error,
  },
  addPageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    borderStyle: 'dashed',
    marginBottom: SPACING.lg,
  },
  addPageIcon: {
    fontSize: 24,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  addPageText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
