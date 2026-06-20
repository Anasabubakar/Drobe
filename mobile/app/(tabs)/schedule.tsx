import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useSchedule } from '../../hooks/useSchedule';
import { useOutfits, OutfitWithItems } from '../../hooks/useOutfits';
import { colors } from '../../lib/theme';

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ScheduleScreen() {
  const router = useRouter();
  const [anchor, setAnchor] = useState(startOfWeek(new Date()));
  const weekStart = anchor;
  const weekEnd = addDays(anchor, 6);
  const { entries, isLoading, assign, markWorn, remove } = useSchedule(weekStart, weekEnd);
  const { outfits } = useOutfits();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date | null>(null);

  const today = new Date();

  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries[number]>();
    for (const e of entries) map.set(e.scheduled_date, e);
    return map;
  }, [entries]);

  const openPicker = (date: Date) => {
    if (outfits.length === 0) {
      Alert.alert(
        'No outfits yet',
        'Build at least one outfit before scheduling.',
        [{ text: 'Build', onPress: () => router.push('/outfits/builder') }, { text: 'Later' }]
      );
      return;
    }
    setPickerDate(date);
    setPickerOpen(true);
  };

  const handleAssign = async (o: OutfitWithItems) => {
    if (!pickerDate) return;
    try {
      await assign({ outfit_id: o.id, scheduled_date: isoDate(pickerDate) });
      setPickerOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed');
    }
  };

  const handleEntryPress = (date: Date) => {
    const entry = entriesByDate.get(isoDate(date));
    if (!entry) {
      openPicker(date);
      return;
    }
    Alert.alert(entry.outfit?.name ?? 'Outfit', undefined, [
      {
        text: entry.is_worn ? 'Mark unworn' : 'Mark worn',
        onPress: () => markWorn({ id: entry.id, is_worn: !entry.is_worn }),
      },
      { text: 'Change outfit', onPress: () => openPicker(date) },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => remove(entry.id),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const monthTitle =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : `${MONTHS[weekStart.getMonth()].slice(0, 3)} – ${MONTHS[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getFullYear()}`;

  return (
    <Screen>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 24, fontWeight: '800' }}>
            Schedule
          </Text>
          <TouchableOpacity onPress={() => setAnchor(startOfWeek(new Date()))}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Today</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginBottom: 16 }}>
          Plan, dress, and track wear.
        </Text>

        {/* Week nav */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => setAnchor(addDays(anchor, -7))}
            style={{ padding: 8 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={{ color: colors.onSurface, fontSize: 15, fontWeight: '700' }}>
            {monthTitle}
          </Text>
          <TouchableOpacity onPress={() => setAnchor(addDays(anchor, 7))} style={{ padding: 8 }}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Day strip */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <Text
              key={i}
              style={{
                color: colors.onSurfaceMuted,
                fontSize: 10,
                fontWeight: '700',
                width: 40,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const isToday = isSameDay(date, today);
            const entry = entriesByDate.get(isoDate(date));
            const past = date < today && !isToday;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleEntryPress(date)}
                style={{
                  width: 40,
                  height: 56,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday
                    ? colors.primary
                    : entry
                    ? entry.is_worn
                      ? colors.surfaceContainerLowest
                      : colors.surfaceContainer
                    : 'transparent',
                  borderWidth: entry && !isToday ? 1 : 0,
                  borderColor: entry?.is_worn ? colors.success : colors.outlineVariant,
                  opacity: past && !entry ? 0.4 : 1,
                }}
              >
                <Text
                  style={{
                    color: isToday ? '#FFF' : colors.onSurface,
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  {date.getDate()}
                </Text>
                {entry && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: entry.is_worn
                        ? colors.success
                        : isToday
                        ? '#FFF'
                        : colors.primary,
                      marginTop: 4,
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Daily list */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const entry = entriesByDate.get(isoDate(date));
            const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
            const dateLabel = `${date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}`;
            const isToday = isSameDay(date, today);

            return (
              <View
                key={i}
                style={{
                  borderRadius: 18,
                  backgroundColor: colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: isToday ? colors.primary : colors.outlineVariant,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: isToday ? colors.primary : colors.onSurfaceVariant,
                      fontSize: 11,
                      fontWeight: '700',
                      letterSpacing: 1.2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {dateLabel} {isToday ? '• Today' : ''}
                  </Text>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontSize: 15,
                      fontWeight: '700',
                      marginTop: 2,
                    }}
                  >
                    {dayName}
                  </Text>
                  {entry?.outfit ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <MaterialCommunityIcons
                        name={entry.is_worn ? 'check-circle' : 'hanger'}
                        size={14}
                        color={entry.is_worn ? colors.success : colors.primary}
                      />
                      <Text
                        style={{
                          color: entry.is_worn ? colors.success : colors.onSurfaceVariant,
                          fontSize: 13,
                          fontWeight: '600',
                        }}
                        numberOfLines={1}
                      >
                        {entry.outfit.name}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: colors.onSurfaceMuted,
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      Nothing planned
                    </Text>
                  )}
                </View>

                {entry?.outfit?.items[0] ? (
                  <TouchableOpacity onPress={() => handleEntryPress(date)}>
                    <Image
                      source={{
                        uri:
                          entry.outfit.items[0].clean_image_url ||
                          entry.outfit.items[0].image_url,
                      }}
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => openPicker(date)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.surfaceContainer,
                      borderWidth: 1,
                      borderColor: colors.outlineVariant,
                      borderStyle: 'dashed',
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Outfit picker modal */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Screen edges={['top']}>
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
            <TouchableOpacity onPress={() => setPickerOpen(false)}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '700' }}>
              {pickerDate
                ? pickerDate.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : ''}
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <FlatList
            data={outfits}
            keyExtractor={o => o.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => {
              const preview =
                item.ai_preview_url ||
                item.items[0]?.clean_image_url ||
                item.items[0]?.image_url;
              return (
                <TouchableOpacity
                  onPress={() => handleAssign(item)}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    aspectRatio: 3 / 4,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceContainer,
                  }}
                >
                  {preview ? (
                    <Image
                      source={{ uri: preview }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
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
                        size={28}
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
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Screen>
      </Modal>
    </Screen>
  );
}
