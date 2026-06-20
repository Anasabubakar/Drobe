import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { useInsights } from '../../hooks/useInsights';
import { colors, CATEGORIES } from '../../lib/theme';

export default function InsightsScreen() {
  const router = useRouter();
  const { data: insights, isLoading } = useInsights();

  if (isLoading || !insights) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (insights.totalItems === 0) {
    return (
      <Screen>
        <EmptyState
          icon="chart-donut"
          title="No data yet"
          description="Add items and start wearing outfits to unlock your wardrobe insights."
          ctaLabel="Add Clothes"
          onCta={() => router.push('/wardrobe/add')}
        />
      </Screen>
    );
  }

  const maxCount = Math.max(1, ...Object.values(insights.byCategory));

  return (
    <Screen scroll>
      <View style={{ padding: 20, paddingBottom: 40 }}>
        <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
          Insights
        </Text>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginBottom: 24 }}>
          Make better use of what you own.
        </Text>

        {/* Stat row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <StatCard label="Items" value={insights.totalItems} />
          <StatCard label="Outfits" value={insights.totalOutfits} />
          <StatCard label="Wears" value={insights.totalWorn} />
        </View>

        {/* Streak hero */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 24,
            padding: 20,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="fire" size={28} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 }}>
              Wear Streak
            </Text>
            <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '800' }}>
              {insights.wearStreakDays} day{insights.wearStreakDays === 1 ? '' : 's'}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
              {insights.wearStreakDays === 0
                ? 'Mark today\'s outfit worn to start a streak.'
                : 'Keep going — log today to keep it alive.'}
            </Text>
          </View>
        </View>

        {/* Category breakdown */}
        <SectionTitle>Closet Distribution</SectionTitle>
        <View
          style={{
            backgroundColor: colors.surfaceContainerLowest,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
            marginBottom: 24,
            gap: 12,
          }}
        >
          {CATEGORIES.map(c => {
            const count = insights.byCategory[c.value] ?? 0;
            const pct = (count / maxCount) * 100;
            return (
              <View key={c.value}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: colors.onSurface, fontSize: 13, fontWeight: '600' }}>
                    {c.label}
                  </Text>
                  <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>{count}</Text>
                </View>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.surfaceContainer,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Most worn */}
        {insights.mostWorn.length > 0 && (
          <>
            <SectionTitle>Most Worn</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, marginBottom: 24 }}
            >
              {insights.mostWorn.map(({ item, wearCount }) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/wardrobe/${item.id}`)}
                  style={{
                    width: 120,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceContainer,
                  }}
                >
                  <View style={{ aspectRatio: 3 / 4 }}>
                    <Image
                      source={{ uri: item.clean_image_url || item.image_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                  <View style={{ padding: 8 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.onSurface, fontSize: 12, fontWeight: '700' }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>
                      Worn {wearCount}×
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Unused */}
        {insights.unused.length > 0 && (
          <>
            <SectionTitle>Unworn ({insights.unused.length})</SectionTitle>
            <Text
              style={{ color: colors.onSurfaceVariant, fontSize: 12, marginBottom: 12 }}
            >
              These items have never been logged as worn. Plan one this week.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, marginBottom: 24 }}
            >
              {insights.unused.slice(0, 12).map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push(`/wardrobe/${item.id}`)}
                  style={{
                    width: 100,
                    aspectRatio: 3 / 4,
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceContainer,
                    opacity: 0.85,
                  }}
                >
                  <Image
                    source={{ uri: item.clean_image_url || item.image_url }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: 11,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        color: colors.onSurface,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}
