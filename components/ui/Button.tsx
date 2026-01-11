import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [
      styles.button,
      styles[`button_${size}`],
    ];

    switch (variant) {
      case 'primary':
        baseStyles.push(styles.buttonPrimary);
        break;
      case 'secondary':
        baseStyles.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyles.push(styles.buttonOutline);
        break;
      case 'ghost':
        baseStyles.push(styles.buttonGhost);
        break;
      case 'danger':
        baseStyles.push(styles.buttonDanger);
        break;
    }

    if (disabled || loading) {
      baseStyles.push(styles.buttonDisabled);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  const getTextStyles = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [
      styles.buttonText,
      styles[`buttonText_${size}`],
    ];

    switch (variant) {
      case 'primary':
        baseStyles.push(styles.buttonTextPrimary);
        break;
      case 'secondary':
        baseStyles.push(styles.buttonTextSecondary);
        break;
      case 'outline':
      case 'ghost':
        baseStyles.push(styles.buttonTextOutline);
        break;
      case 'danger':
        baseStyles.push(styles.buttonTextDanger);
        break;
    }

    if (textStyle) {
      baseStyles.push(textStyle);
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.textInverse : COLORS.primary} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyles()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  button_small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  button_medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  button_large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText_small: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  buttonText_medium: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  buttonText_large: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  buttonTextPrimary: {
    color: COLORS.textInverse,
  },
  buttonTextSecondary: {
    color: COLORS.text,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextDanger: {
    color: COLORS.textInverse,
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
});

// Add missing spacing constant
const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export default Button;
