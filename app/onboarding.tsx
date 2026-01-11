import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Create Storybooks',
    description: 'Turn your photos and text into beautiful storybooks for children',
    image: require('../../assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Read Together',
    description: 'Enjoy story time with beautiful illustrations and engaging narration',
    image: require('../../assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Translate Anywhere',
    description: 'Instantly translate stories to any language for global audiences',
    image: require('../../assets/images/onboarding-3.png'),
  },
];

export default function Onboarding() {
  const router = useRouter();

  useEffect(() => {
    // Auto-advance after 3 seconds or wait for user interaction
    // For now, show the first slide
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>StoryTime Creator</Text>
        <Text style={styles.subtitle}>Create magical storybooks for children</Text>
        
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📚</Text>
            </View>
            <Text style={styles.featureText}>Create Stories</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🖼️</Text>
            </View>
            <Text style={styles.featureText}>Add Photos</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🌍</Text>
            </View>
            <Text style={styles.featureText}>Translate</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🔊</Text>
            </View>
            <Text style={styles.featureText}>Read Aloud</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.ctaText}>Ready to start creating?</Text>
        <Text style={styles.ctaSubtext}>Sign up or log in to access your library</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  featureItem: {
    alignItems: 'center',
    width: (width - SPACING.xxl * 3) / 2,
  },
  featureIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureEmoji: {
    fontSize: 36,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  bottomSection: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ctaSubtext: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
});

export { ONBOARDING_DATA };
