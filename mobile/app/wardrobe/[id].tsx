import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Chip } from '../../components/Chip';
import { CATEGORIES, OCCASIONS, COLOR_SWATCHES, colors } from '../../lib/theme';
import { useClothingItem, updateClothingItem } from '../../hooks/useWardrobe';
import { useWardrobe } from '../../hooks/useWardrobe';
import { ClothingCategory } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: item, isLoading } = useClothingItem(id);
  const { deleteItem } = useWardrobe('all');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('top');
  const [color, setColor] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name ?? '');
      setCategory(item.category);
      setColor(item.color ?? null);
      setBrand(item.brand ?? '');
      setNotes(item.notes ?? '');
      setTags(item.tags ?? []);
    }
  }, [item]);

  if (isLoading || !item) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const toggleTag = (t: string) =>
    setTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateClothingItem(item.id, {
        name: name.trim() || 'Untitled Item',
        category,
        color,
        brand: brand.trim() || null,
        notes: notes.trim() || null,
        tags,
      });
      await qc.invalidateQueries({ queryKey: ['wardrobe'] });
      await qc.invalidateQueries({ queryKey: ['clothing', item.id] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () =>
    Alert.alert('Delete this item?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);

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
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 15 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.onSurface }}>
          Edit Item
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              aspectRatio: 3 / 4,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: colors.surfaceContainer,
              marginBottom: 20,
            }}
          >
            <Image
              source={{ uri: item.clean_image_url || item.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>

          <View style={{ gap: 16 }}>
            <TextField label="Name" value={name} onChangeText={setName} />

            <View>
              <Text style={labelStyle}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 12 }}
              >
                {CATEGORIES.map(c => (
                  <Chip
                    key={c.value}
                    label={c.label}
                    active={category === c.value}
                    onPress={() => setCategory(c.value as ClothingCategory)}
                  />
                ))}
              </ScrollView>
            </View>

            <View>
              <Text style={labelStyle}>Color</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: 12 }}
              >
                {COLOR_SWATCHES.map(s => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => setColor(color === s.value ? null : s.value)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: s.hex,
                      borderWidth: color === s.value ? 3 : 1,
                      borderColor: color === s.value ? colors.primary : 'rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            <TextField label="Brand" value={brand} onChangeText={setBrand} />

            <View>
              <Text style={labelStyle}>Occasion tags</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {OCCASIONS.map(o => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    active={tags.includes(o.value)}
                    onPress={() => toggleTag(o.value)}
                  />
                ))}
              </View>
            </View>

            <TextField label="Notes" value={notes} onChangeText={setNotes} multiline />

            <TouchableOpacity
              onPress={handleDelete}
              style={{ paddingVertical: 16, alignItems: 'center', marginTop: 16 }}
            >
              <Text style={{ color: colors.error, fontWeight: '700', fontSize: 14 }}>
                Delete this item
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const labelStyle = {
  color: colors.onSurfaceVariant,
  fontSize: 11,
  fontWeight: '700' as const,
  letterSpacing: 1.2,
  textTransform: 'uppercase' as const,
  marginBottom: 8,
  marginLeft: 4,
};
