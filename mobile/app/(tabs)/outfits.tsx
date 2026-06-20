import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/Chip';
import { useOutfits, OutfitWithItems } from '../../hooks/useOutfits';
import { colors, OCCASIONS } from '../../lib/theme';

const FILTERS = [{ value: 'all', label: 'All' }, ...OCCASIONS] as const;

export default function OutfitsScreen() {
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();
  const { outfits, isLoading, refetch } = useOutfits();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = filter === 'all' ? outfits : outfits.filter(o => o.occasion === filter);

  const renderItem = ({ item }: { item: OutfitWithItems }) => {
    const preview =
      item.ai_preview_url ||
      item.items[0]?.clean_image_url ||
      item.items[0]?.image_url;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/outfits/${item.id}`)}
        activeOpacity={0.85}
        style={{
          flex: 1,
          aspectRatio: 3 / 4,
          borderRadius: 18,
          overflow: 'hidden',
          backgroundColor: colors.surfaceContainer,
          marginBottom: 12,
        }}
      >
        {preview ? (
          <Image
            source={{ uri: preview }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="hanger"
              size={32}
              color={colors.onSurfaceMuted}
            />
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 10,
            backgroundColor: 'rgba(0,0,0,0.45)',
          }}
        >
          <Text numberOfLines={1} style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>
            {item.name}
          </Text>
          {item.occasion && (
            <Text
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.2,
              }}
            >
              {item.occasion}
            </Text>
          )}
        </View>
        {item.is_ai_generated && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.95)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <MaterialCommunityIcons name="creation" size={11} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>AI</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <View>
          <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '800' }}>Outfits</Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
            {outfits.length} saved look{outfits.length === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/outfits/builder')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            height: 40,
            borderRadius: 20,
          }}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Build</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
      >
        {FILTERS.map(f => (
          <Chip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="hanger"
          title={filter === 'all' ? 'No outfits yet' : 'Nothing here'}
          description={
            filter === 'all'
              ? 'Build your first look or let Drobe suggest one.'
              : 'No outfits for this occasion.'
          }
          ctaLabel="Build outfit"
          onCta={() => router.push('/outfits/builder')}
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </Screen>
  );
}
