import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useOutfit, useOutfits } from '../../hooks/useOutfits';
import { useSchedule } from '../../hooks/useSchedule';
import { colors } from '../../lib/theme';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: outfit, isLoading } = useOutfit(id);
  const { deleteOutfit } = useOutfits();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 13);
  const { assign } = useSchedule(weekStart, weekEnd);

  if (isLoading || !outfit) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const handleAssignToday = async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      await assign({ outfit_id: outfit.id, scheduled_date: date });
      Alert.alert('Scheduled', 'This outfit is on the schedule for today.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not schedule');
    }
  };

  const handleDelete = () =>
    Alert.alert('Delete this outfit?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteOutfit(outfit.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: '800' }}>
          {outfit.name}
        </Text>
        {outfit.occasion && (
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 1.4,
              marginTop: 4,
            }}
          >
            {outfit.occasion}
          </Text>
        )}
        {outfit.is_ai_generated && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <MaterialCommunityIcons name="creation" size={14} color={colors.primaryLight} />
            <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '600' }}>
              Drobe-suggested
            </Text>
          </View>
        )}

        <View style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {outfit.items.map(item => (
            <View
              key={item.id}
              style={{
                width: '47%',
                aspectRatio: 3 / 4,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: colors.surfaceContainer,
              }}
            >
              <Image
                source={{ uri: item.clean_image_url || item.image_url }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
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
                <Text numberOfLines={1} style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
                  {item.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 28, gap: 12 }}>
          <Button
            label="Wear today"
            onPress={handleAssignToday}
            icon={<MaterialCommunityIcons name="calendar-check" size={18} color="#FFF" />}
          />
          <Button
            label="Add to schedule"
            onPress={() => router.push('/(tabs)/schedule')}
            variant="secondary"
            icon={
              <MaterialCommunityIcons name="calendar-plus" size={18} color={colors.onSurface} />
            }
          />
        </View>
      </View>
    </Screen>
  );
}
