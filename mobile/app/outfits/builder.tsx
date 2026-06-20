import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { ClothingItem, ClothingCategory, OccasionType } from '../../types';
import { OCCASIONS, colors } from '../../lib/theme';

type SlotKey = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

const SLOTS: { key: SlotKey; label: string; icon: any }[] = [
  { key: 'top', label: 'Top', icon: 'tshirt-crew-outline' },
  { key: 'bottom', label: 'Bottom', icon: 'human-male' },
  { key: 'dress', label: 'Dress', icon: 'human-female' },
  { key: 'outerwear', label: 'Outerwear', icon: 'jacket' },
  { key: 'shoes', label: 'Shoes', icon: 'shoe-sneaker' },
  { key: 'accessory', label: 'Accessory', icon: 'sunglasses' },
];

export default function OutfitBuilderScreen() {
  const router = useRouter();
  const { items: closet, isLoading } = useWardrobe('all');
  const { saveOutfit } = useOutfits();

  const [canvas, setCanvas] = useState<Partial<Record<SlotKey, ClothingItem>>>({});
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>('casual');
  const [filter, setFilter] = useState<SlotKey | 'all'>('all');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return closet;
    return closet.filter(c => c.category === filter);
  }, [closet, filter]);

  const assign = (item: ClothingItem) => {
    const slot = item.category as SlotKey;
    setCanvas(prev => ({ ...prev, [slot]: item }));
  };

  const removeSlot = (slot: SlotKey) =>
    setCanvas(prev => {
      const n = { ...prev };
      delete n[slot];
      return n;
    });

  const itemIds = Object.values(canvas).map(c => c!.id);

  const handleSave = async () => {
    if (itemIds.length < 2) {
      Alert.alert('Add more items', 'An outfit needs at least 2 items.');
      return;
    }
    setSaving(true);
    try {
      await saveOutfit({
        name: name.trim() || 'Untitled Look',
        occasion,
        item_ids: itemIds,
      });
      router.replace('/(tabs)/outfits');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 15 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '700' }}>
          Outfit Builder
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>
            {saving ? 'Saving' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Name + occasion */}
          <View
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: 16,
              padding: 12,
              gap: 12,
              marginBottom: 16,
            }}
          >
            <TextInput
              placeholder="Name this look..."
              placeholderTextColor={colors.onSurfaceMuted}
              value={name}
              onChangeText={setName}
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.onSurface,
                paddingVertical: 4,
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {OCCASIONS.map(o => (
                <Chip
                  key={o.value}
                  label={o.label}
                  active={occasion === o.value}
                  onPress={() => setOccasion(o.value as OccasionType)}
                  small
                />
              ))}
            </ScrollView>
          </View>

          {/* Slot grid */}
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Your look ({itemIds.length})
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {SLOTS.map(s => {
              const item = canvas[s.key];
              return (
                <View
                  key={s.key}
                  style={{
                    width: '31.5%',
                    aspectRatio: 1,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceContainer,
                    borderWidth: item ? 0 : 1,
                    borderColor: colors.outlineVariant,
                    borderStyle: item ? 'solid' : 'dashed',
                  }}
                >
                  {item ? (
                    <>
                      <Image
                        source={{ uri: item.clean_image_url || item.image_url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeSlot(s.key)}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="close" size={14} color={colors.onSurface} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={s.icon}
                        size={22}
                        color={colors.onSurfaceMuted}
                      />
                      <Text style={{ color: colors.onSurfaceMuted, fontSize: 10 }}>
                        {s.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Closet filter */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '700' }}>
              From your closet
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
            >
              <Chip
                label="All"
                active={filter === 'all'}
                onPress={() => setFilter('all')}
                small
              />
              {SLOTS.map(s => (
                <Chip
                  key={s.key}
                  label={s.label}
                  active={filter === s.key}
                  onPress={() => setFilter(s.key)}
                  small
                />
              ))}
            </ScrollView>
          </View>

          {/* Closet grid */}
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="hanger"
              title="Nothing to show"
              description="Add some items to your closet first."
              ctaLabel="Add Clothes"
              onCta={() => router.push('/wardrobe/add')}
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {filtered.map(item => {
                const selected = Object.values(canvas).some(c => c?.id === item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => assign(item)}
                    style={{
                      width: '23%',
                      aspectRatio: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: colors.surfaceContainer,
                      borderWidth: selected ? 2 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    <Image
                      source={{ uri: item.clean_image_url || item.image_url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                    {selected && (
                      <View
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(231,90,102,0.18)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
