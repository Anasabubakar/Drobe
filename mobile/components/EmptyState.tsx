import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../lib/theme';

interface Props {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = 'hanger', title, description, ctaLabel, onCta }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.surfaceContainer,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <MaterialCommunityIcons name={icon} size={42} color={colors.primary} />
      </View>
      <Text
        style={{
          color: colors.onSurface,
          fontSize: 20,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 20,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}
      {ctaLabel && onCta && (
        <Button label={ctaLabel} onPress={onCta} fullWidth={false} />
      )}
    </View>
  );
}
