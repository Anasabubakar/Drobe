import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { colors } from '../lib/theme';

interface Props extends TextInputProps {
  label?: string;
  trailing?: React.ReactNode;
  error?: string | null;
}

export function TextField({ label, trailing, error, style, ...rest }: Props) {
  return (
    <View>
      {label && (
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginBottom: 6,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: error ? colors.error : 'transparent',
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <TextInput
          placeholderTextColor={colors.onSurfaceMuted}
          style={[
            {
              flex: 1,
              color: colors.onSurface,
              fontSize: 15,
              paddingVertical: 0,
            },
            style,
          ]}
          {...rest}
        />
        {trailing}
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
