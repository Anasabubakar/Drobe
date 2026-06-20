import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Chip } from '../../components/Chip';
import { CATEGORIES, OCCASIONS, COLOR_SWATCHES, colors } from '../../lib/theme';
import { createClothingItem } from '../../hooks/useWardrobe';
import { ClothingCategory } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

interface QueueItem {
  id: string;
  uri: string;
  name: string;
  category: ClothingCategory;
  color: string | null;
  brand: string;
  tags: string[];
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AddItemsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const active = queue[activeIdx];

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to add clothing.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.9,
    });
    if (result.canceled) return;
    addToQueue(result.assets.map(a => a.uri));
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow camera access to add clothing.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled) return;
    addToQueue(result.assets.map(a => a.uri));
  };

  const addToQueue = (uris: string[]) => {
    const newItems: QueueItem[] = uris.map((uri, i) => ({
      id: newId(),
      uri,
      name: '',
      category: 'top',
      color: null,
      brand: '',
      tags: [],
      status: 'pending',
    }));
    setQueue(prev => [...prev, ...newItems]);
    setActiveIdx(queue.length);
  };

  const updateActive = (patch: Partial<QueueItem>) => {
    setQueue(prev => prev.map((q, i) => (i === activeIdx ? { ...q, ...patch } : q)));
  };

  const removeActive = () => {
    setQueue(prev => prev.filter((_, i) => i !== activeIdx));
    setActiveIdx(i => Math.max(0, i - 1));
  };

  const toggleTag = (tag: string) => {
    if (!active) return;
    const has = active.tags.includes(tag);
    updateActive({ tags: has ? active.tags.filter(t => t !== tag) : [...active.tags, tag] });
  };

  const uploadAll = async () => {
    if (queue.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (item.status === 'done') continue;
        setQueue(prev => prev.map((q, idx) => (idx === i ? { ...q, status: 'uploading' } : q)));
        try {
          await createClothingItem({
            name: item.name.trim() || 'Untitled Item',
            category: item.category,
            color: item.color,
            brand: item.brand.trim() || null,
            tags: item.tags,
            localImageUri: item.uri,
          });
          setQueue(prev => prev.map((q, idx) => (idx === i ? { ...q, status: 'done' } : q)));
        } catch (e: any) {
          setQueue(prev =>
            prev.map((q, idx) =>
              idx === i ? { ...q, status: 'error', errorMsg: e.message ?? 'Upload failed' } : q
            )
          );
        }
      }
      await qc.invalidateQueries({ queryKey: ['wardrobe'] });
      const failed = queue.filter(q => q.status === 'error').length;
      Alert.alert(
        failed ? 'Partial Upload' : 'Added',
        failed
          ? `${queue.length - failed} added, ${failed} failed. Try again for failed items.`
          : `${queue.length} item${queue.length === 1 ? '' : 's'} added to your closet.`,
        [{ text: 'Done', onPress: () => router.replace('/(tabs)/closet') }]
      );
    } finally {
      setUploading(false);
    }
  };

  if (queue.length === 0) {
    return (
      <Screen edges={['top', 'bottom']}>
        <Header onCancel={() => router.back()} title="Add to Closet" />
        <View style={{ flex: 1, padding: 20, gap: 16, justifyContent: 'center' }}>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Add your clothes
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 24,
              paddingHorizontal: 20,
            }}
          >
            Pick from your gallery or snap a photo. You can edit details before saving.
          </Text>

          <Button
            label="Choose from Gallery"
            onPress={pickFromLibrary}
            icon={<MaterialCommunityIcons name="image-multiple" size={20} color="#FFF" />}
          />
          <Button
            label="Take a Photo"
            onPress={pickFromCamera}
            variant="secondary"
            icon={
              <MaterialCommunityIcons name="camera-outline" size={20} color={colors.onSurface} />
            }
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        onCancel={() => {
          if (uploading) return;
          Alert.alert('Discard?', 'You will lose unsaved items.', [
            { text: 'Keep editing', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          ]);
        }}
        title={`Item ${activeIdx + 1} of ${queue.length}`}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item thumbnails */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
          >
            {queue.map((q, idx) => (
              <TouchableOpacity
                key={q.id}
                onPress={() => setActiveIdx(idx)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: idx === activeIdx ? 2 : 0,
                  borderColor: colors.primary,
                }}
              >
                <Image source={{ uri: q.uri }} style={{ width: '100%', height: '100%' }} />
                {q.status === 'done' && (
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(27,135,63,0.55)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  </View>
                )}
                {q.status === 'uploading' && (
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ActivityIndicator color="#FFF" size="small" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={pickFromLibrary}
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: colors.surfaceContainer,
                borderWidth: 1,
                borderColor: colors.outlineVariant,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.onSurfaceMuted} />
            </TouchableOpacity>
          </ScrollView>

          {/* Image preview */}
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
              source={{ uri: active.uri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            <TextField
              label="Name"
              placeholder="e.g. Black graphic tee"
              value={active.name}
              onChangeText={(t: string) => updateActive({ name: t })}
            />

            <View>
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
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingRight: 12 }}
              >
                {CATEGORIES.map(c => (
                  <Chip
                    key={c.value}
                    label={c.label}
                    active={active.category === c.value}
                    onPress={() => updateActive({ category: c.value as ClothingCategory })}
                  />
                ))}
              </ScrollView>
            </View>

            <View>
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
                Color
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: 12 }}
              >
                {COLOR_SWATCHES.map(s => (
                  <TouchableOpacity
                    key={s.value}
                    onPress={() => updateActive({ color: active.color === s.value ? null : s.value })}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: s.hex,
                      borderWidth: active.color === s.value ? 3 : 1,
                      borderColor:
                        active.color === s.value ? colors.primary : 'rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            <TextField
              label="Brand (optional)"
              placeholder="e.g. Uniqlo"
              value={active.brand}
              onChangeText={(t: string) => updateActive({ brand: t })}
            />

            <View>
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
                Occasion tags
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {OCCASIONS.map(o => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    active={active.tags.includes(o.value)}
                    onPress={() => toggleTag(o.value)}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={removeActive}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: colors.error, fontWeight: '600', fontSize: 13 }}>
                Remove this item
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View
          style={{
            padding: 16,
            paddingBottom: Platform.OS === 'ios' ? 16 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.outlineVariant,
            backgroundColor: colors.surface,
          }}
        >
          <Button
            label={
              uploading
                ? 'Saving...'
                : `Add ${queue.length} item${queue.length === 1 ? '' : 's'} to closet`
            }
            onPress={uploadAll}
            loading={uploading}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Header({ title, onCancel }: { title: string; onCancel: () => void }) {
  return (
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
      <TouchableOpacity onPress={onCancel}>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 15 }}>Cancel</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.onSurface }}>{title}</Text>
      <View style={{ width: 50 }} />
    </View>
  );
}
