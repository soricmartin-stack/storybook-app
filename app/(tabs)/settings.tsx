import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SUPPORTED_LANGUAGES, Language } from '../../config/openai';

export default function Settings() {
  const router = useRouter();
  const { user, logout, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({ displayName });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRateApp = () => {
    // Open app store for rating
    Linking.openURL('https://play.google.com/store/apps/details?id=com.soricmartinstack.storybook');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://your-privacy-policy-url.com');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://your-terms-url.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          <Input
            label="Display Name"
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Button
            title="Update Profile"
            variant="outline"
            onPress={handleUpdateProfile}
          />
        </View>

        {/* Translation Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Translation</Text>
          <Text style={styles.sectionSubtitle}>
            Default language for translations
          </Text>
          
          <View style={styles.languageGrid}>
            {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>
                  {lang.code === 'en' ? '🇺🇸' : 
                   lang.code === 'es' ? '🇪🇸' : 
                   lang.code === 'fr' ? '🇫🇷' : 
                   lang.code === 'de' ? '🇩🇪' : 
                   lang.code === 'it' ? '🇮🇹' : 
                   lang.code === 'pt' ? '🇧🇷' : '🌍'}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Keys */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Keys</Text>
          <Text style={styles.sectionSubtitle}>
            Add your OpenAI API key for translation features
          </Text>
          
          <TouchableOpacity 
            style={styles.apiKeyToggle}
            onPress={() => setShowKeyInput(!showKeyInput)}
          >
            <Text style={styles.apiKeyToggleText}>
              {showKeyInput ? 'Hide API Key' : 'Add OpenAI API Key'}
            </Text>
          </TouchableOpacity>

          {showKeyInput && (
            <Input
              label="OpenAI API Key"
              placeholder="sk-..."
              value={openAIKey}
              onChangeText={setOpenAIKey}
              secureTextEntry
              helperText="Your API key is stored securely on your device"
            />
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Storybooks Created</Text>
            <Text style={styles.aboutValue}>{user?.storybookCount || 0}</Text>
          </View>

          <TouchableOpacity style={styles.aboutLink} onPress={handleRateApp}>
            <Text style={styles.aboutLinkText}>Rate this app ⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutLink} onPress={handlePrivacyPolicy}>
            <Text style={styles.aboutLinkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutLink} onPress={handleTermsOfService}>
            <Text style={styles.aboutLinkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.copyright}>
          © 2024 StoryTime Creator. Made with ❤️ for children everywhere.
        </Text>
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
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  languageOption: {
    width: '30%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
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
  apiKeyToggle: {
    paddingVertical: SPACING.md,
  },
  apiKeyToggleText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  aboutLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
  },
  aboutValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  aboutLink: {
    paddingVertical: SPACING.md,
  },
  aboutLinkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
  },
  copyright: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
});
