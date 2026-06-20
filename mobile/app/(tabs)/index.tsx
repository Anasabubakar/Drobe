import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { useProfile } from '../../hooks/useProfile';
import { suggestOutfits, OutfitSuggestion } from '../../lib/recommendations';
import { OCCASIONS, colors } from '../../lib/theme';
import { OccasionType } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { items: closet, isLoading: loadingCloset } = useWardrobe('all');
  const { outfits, saveOutfit } = useOutfits();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [occasion, setOccasion] = useState<OccasionType>('casual');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [generating, setGenerating] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName =
    profile?.full_name?.split(' ')[0] ?? '';

  const handleGetDressed = async () => {
    if (closet.length < 2) {
      Alert.alert(
        'Add a few items first',
        'Drobe needs at least 2 items to suggest an outfit. Add some clothes to your closet.',
        [{ text: 'Add Now', onPress: () => router.push('/wardrobe/add') }, { text: 'Later' }]
      );
      return;
    }
    setPickerOpen(true);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const s = suggestOutfits(closet, occasion, { count: 3 });
      setSuggestions(s);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSuggestion = async (sug: OutfitSuggestion) => {
    try {
      await saveOutfit({
        name: sug.name,
        occasion: sug.occasion,
        item_ids: sug.items.map(i => i.id),
        is_ai_generated: true,
      });
      Alert.alert('Saved', 'Outfit added to your collection.');
      setPickerOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save');
    }
  };

  const recentOutfits = outfits.slice(0, 6);

  return (
    <Screen scroll>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Logo size={26} />
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surfaceContainer,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {profile?.portrait_url ? (
              <Image source={{ uri: profile.portrait_url }} style={{ width: 40, height: 40 }} />
            ) : (
              <MaterialCommunityIcons name="account" size={22} color={colors.onSurfaceVariant} />
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>{greeting}</Text>
          <Text style={{ color: colors.onSurface, fontSize: 28, fontWeight: '800' }}>
            {displayName ? `${displayName},` : 'Welcome back,'}
          </Text>
          <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: '600' }}>
            ready to get dressed?
          </Text>
        </View>

        {/* Hero CTA card */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 28,
            padding: 24,
            marginBottom: 28,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Instant outfit
          </Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: '800',
              lineHeight: 32,
              marginBottom: 16,
            }}
          >
            Decide what to wear in 10 seconds.
          </Text>
          <Button
            label="Get Dressed Now"
            onPress={handleGetDressed}
            variant="secondary"
            fullWidth={false}
            size="md"
            icon={<MaterialCommunityIcons name="creation" size={18} color={colors.primary} />}
          />
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          <QuickAction
            icon="camera-plus-outline"
            label="Add Clothes"
            onPress={() => router.push('/wardrobe/add')}
          />
          <QuickAction
            icon="hanger"
            label="Build Outfit"
            onPress={() => router.push('/outfits/builder')}
          />
          <QuickAction
            icon="calendar-plus"
            label="Plan Week"
            onPress={() => router.push('/(tabs)/schedule')}
          />
        </View>

        {/* Recent outfits */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.onSurface, fontSize: 20, fontWeight: '700' }}>
            Your saved looks
          </Text>
          {outfits.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/outfits')}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                See all
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingCloset ? (
          <ActivityIndicator color={colors.primary} />
        ) : recentOutfits.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.outlineVariant,
            }}
          >
            <MaterialCommunityIcons name="hanger" size={36} color={colors.onSurfaceMuted} />
            <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '600', marginTop: 8 }}>
              No outfits yet
            </Text>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 13, marginTop: 4, marginBottom: 16, textAlign: 'center' }}>
              Build your first look or let Drobe suggest one.
            </Text>
            <Button
              label="Build Outfit"
              onPress={() => router.push('/outfits/builder')}
              fullWidth={false}
              size="sm"
            />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
          >
            {recentOutfits.map(o => {
              const preview =
                o.ai_preview_url ||
                o.items[0]?.clean_image_url ||
                o.items[0]?.image_url;
              return (
                <TouchableOpacity
                  key={o.id}
                  onPress={() => router.push(`/outfits/${o.id}`)}
                  style={{
                    width: 160,
                    borderRadius: 20,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceContainer,
                  }}
                >
                  <View style={{ aspectRatio: 3 / 4 }}>
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
                          name="image-off-outline"
                          size={32}
                          color={colors.onSurfaceMuted}
                        />
                      </View>
                    )}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.onSurface, fontSize: 13, fontWeight: '700' }}
                    >
                      {o.name}
                    </Text>
                    {o.occasion && (
                      <Text
                        style={{
                          color: colors.onSurfaceVariant,
                          fontSize: 11,
                          textTransform: 'capitalize',
                        }}
                      >
                        {o.occasion}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Quick suggest modal */}
      <Modal
        animationType="slide"
        visible={pickerOpen}
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Screen edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.outlineVariant,
            }}
          >
            <TouchableOpacity onPress={() => setPickerOpen(false)}>
              <Text style={{ color: colors.onSurfaceVariant, fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.onSurface }}>
              Get Dressed
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              What's the occasion?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {OCCASIONS.map(o => (
                <Chip
                  key={o.value}
                  label={o.label}
                  active={occasion === o.value}
                  onPress={() => setOccasion(o.value as OccasionType)}
                />
              ))}
            </View>

            <Button
              label={suggestions.length ? 'Try again' : 'Generate looks'}
              onPress={generate}
              loading={generating}
              icon={<MaterialCommunityIcons name="creation" size={18} color="#FFF" />}
            />

            <View style={{ marginTop: 24, gap: 16 }}>
              {suggestions.map((s, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.surfaceContainerLowest,
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: colors.onSurface, fontSize: 16, fontWeight: '700' }}>
                    {s.name}
                  </Text>
                  <Text
                    style={{ color: colors.onSurfaceVariant, fontSize: 12, marginTop: 2 }}
                  >
                    {s.reasoning}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 12 }}>
                    {s.items.map(it => (
                      <View
                        key={it.id}
                        style={{
                          flex: 1,
                          aspectRatio: 3 / 4,
                          borderRadius: 12,
                          overflow: 'hidden',
                          backgroundColor: colors.surfaceContainer,
                        }}
                      >
                        <Image
                          source={{ uri: it.clean_image_url || it.image_url }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      </View>
                    ))}
                  </View>
                  <Button
                    label="Save this look"
                    onPress={() => handleSaveSuggestion(s)}
                    size="sm"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1,
        backgroundColor: colors.surfaceContainerLowest,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 6,
      }}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <Text style={{ color: colors.onSurface, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
