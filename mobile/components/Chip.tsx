import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../lib/theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export function Chip({ label, active, onPress, small }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 6 : 8,
        borderRadius: 999,
        backgroundColor: active ? colors.primary : 'transparent',
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.outlineVariant,
      }}
    >
      <Text
        style={{
          color: active ? '#FFFFFF' : colors.onSurfaceVariant,
          fontSize: small ? 11 : 13,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
