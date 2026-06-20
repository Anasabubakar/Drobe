import React from 'react';
import { View, ViewStyle, ScrollView, ScrollViewProps, RefreshControl } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
  backgroundColor?: string;
}

export function Screen({
  children,
  scroll = false,
  refreshing,
  onRefresh,
  edges = ['top'],
  style,
  contentStyle,
  scrollProps,
  backgroundColor = colors.surface,
}: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor }, style]}>
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor }, style]}>
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}
