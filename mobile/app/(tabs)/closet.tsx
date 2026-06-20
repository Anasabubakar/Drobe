import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { Chip } from '../../components/Chip';
import { useWardrobe } from '../../hooks/useWardrobe';
import { ClothingItem } from '../../types';
import { CATEGORIES, colors } from '../../lib/theme';

const CATEGORY_TABS = [{ value: 'all', label: 'All' }, ...CATEGORIES] as const;

export default function ClosetScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { items, isLoading, refetch, deleteItem } = useWardrobe(activeCategory);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = search.trim()
    ? items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.color?.toLowerCase().includes(search.toLowerCase()) ||
        i.brand?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const handleLongPress = (item: ClothingItem) => {
    Alert.alert(item.name, undefined, [
      { text: 'Edit', onPress: () => router.push(`/wardrobe/${item.id}`) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete this item?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/wardrobe/${item.id}`)}
      onLongPress={() => handleLongPress(item)}
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
      <Image
        source={{ uri: item.clean_image_url || item.image_url }}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={150}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 10,
          backgroundColor: 'rgba(0,0,0,0.42)',
        }}
      >
        <Text numberOfLines={1} style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
          {item.name}
        </Text>
        {item.color && (
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, textTransform: 'capitalize' }}>
            {item.color}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '800' }}>
            Closet
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/wardrobe/add')}
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
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Add</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 44,
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={colors.onSurfaceMuted} />
          <TextInput
            placeholder="Search your closet..."
            placeholderTextColor={colors.onSurfaceMuted}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.onSurface, fontSize: 15 }}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={{ paddingVertical: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORY_TABS.map(c => (
            <Chip
              key={c.value}
              label={c.label}
              active={activeCategory === c.value}
              onPress={() => setActiveCategory(c.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search ? 'magnify-close' : 'hanger'}
          title={search ? 'No matches' : 'Your closet is empty'}
          description={
            search
              ? 'Try a different search.'
              : 'Add a few photos of your clothes to get started.'
          }
          ctaLabel={search ? undefined : 'Add first item'}
          onCta={search ? undefined : () => router.push('/wardrobe/add')}
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
