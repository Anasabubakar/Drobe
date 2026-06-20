import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../lib/theme';

interface Props {
  size?: number;
  showWordmark?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function Logo({ size = 28, showWordmark = true, color = colors.primary, style }: Props) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Twisted ribbon — folding garment symbol */}
        <Path
          d="M16 14 C32 6, 48 22, 32 32 C16 42, 48 58, 32 50 C16 42, 32 32, 32 32"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M16 14 C24 22, 40 28, 48 22"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.5}
          fill="none"
        />
      </Svg>
      {showWordmark && (
        <Text style={{ color, fontSize: size * 0.85, fontWeight: '900', letterSpacing: -1 }}>
          DROBE
        </Text>
      )}
    </View>
  );
}
