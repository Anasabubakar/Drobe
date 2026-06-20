import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { colors } from '../lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  icon,
  style,
}: Props) {
  const heights = { sm: 40, md: 52, lg: 56 };
  const radii = { sm: 12, md: 16, lg: 18 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };

  const variantStyles: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: '#FFFFFF' },
    secondary: { bg: colors.surfaceContainer, fg: colors.onSurface, border: colors.outlineVariant },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.errorContainer, fg: colors.error },
  };

  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          height: heights[size],
          borderRadius: radii[size],
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        variant === 'primary' && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon}
          <Text style={{ color: v.fg, fontSize: fontSizes[size], fontWeight: '700' }}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
