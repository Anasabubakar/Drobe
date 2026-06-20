import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useProfile } from '../../hooks/useProfile';
import { useInsights } from '../../hooks/useInsights';
import { colors } from '../../lib/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const { profile, isLoading, updateProfile, uploadPortrait } = useProfile();
  const { data: insights } = useInsights();
  const [uploading, setUploading] = useState(false);
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  const handleSignOut = async () => {
    Alert.alert('Sign out?', 'You will need to log in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handlePortrait = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload a portrait.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      await uploadPortrait(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openNameModal = () => {
    setDraftName(profile?.full_name ?? '');
    setNameModalOpen(true);
  };

  const saveName = async () => {
    try {
      await updateProfile({ full_name: draftName.trim() });
      setNameModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save');
    }
  };

  const displayName = profile?.full_name || email.split('@')[0] || 'You';
  const initials = displayName
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Screen scroll>
      <View style={{ padding: 24, paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={handlePortrait} activeOpacity={0.8}>
            <View
              style={{
                width: 104,
                height: 104,
                borderRadius: 52,
                backgroundColor: colors.surfaceContainer,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            >
              {uploading ? (
                <ActivityIndicator color={colors.primary} />
              ) : profile?.portrait_url ? (
                <Image
                  source={{ uri: profile.portrait_url }}
                  style={{ width: 104, height: 104 }}
                />
              ) : (
                <Text style={{ color: colors.primary, fontSize: 32, fontWeight: '800' }}>
                  {initials}
                </Text>
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: colors.surface,
              }}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              color: colors.onSurface,
              fontSize: 22,
              fontWeight: '800',
              marginTop: 16,
            }}
          >
            {displayName}
          </Text>
          <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>{email}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
          <Stat label="Items" value={insights?.totalItems ?? 0} />
          <Stat label="Outfits" value={insights?.totalOutfits ?? 0} />
          <Stat label="Wears" value={insights?.totalWorn ?? 0} />
        </View>

        {/* Menu */}
        <SectionLabel>Account</SectionLabel>
        <MenuCard>
          <MenuRow
            icon="account-edit-outline"
            label="Edit name"
            value={profile?.full_name ?? '—'}
            onPress={openNameModal}
          />
          <MenuRow
            icon="image-outline"
            label="Portrait"
            value={profile?.portrait_url ? 'Uploaded' : 'Not set'}
            onPress={handlePortrait}
          />
          <MenuRow
            icon="lock-outline"
            label="Reset password"
            value="Email link"
            onPress={async () => {
              if (!email) return;
              await supabase.auth.resetPasswordForEmail(email);
              Alert.alert('Email sent', 'Check your inbox for the reset link.');
            }}
            last
          />
        </MenuCard>

        <SectionLabel>Support</SectionLabel>
        <MenuCard>
          <MenuRow
            icon="information-outline"
            label="About Drobe"
            value="v1.0.0"
            onPress={() =>
              Alert.alert(
                'Drobe',
                'The digital solution to decision fatigue. Pick today\'s look in 10 seconds.'
              )
            }
          />
          <MenuRow
            icon="email-outline"
            label="Contact"
            value="hello@drobe.app"
            onPress={() => Linking.openURL('mailto:hello@drobe.app')}
            last
          />
        </MenuCard>

        <View style={{ marginTop: 16 }}>
          <Button label="Sign out" onPress={handleSignOut} variant="danger" />
        </View>
      </View>

      <Modal
        visible={nameModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setNameModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 360,
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.onSurface }}>
              Edit Name
            </Text>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor={colors.onSurfaceMuted}
              style={{
                borderWidth: 1,
                borderColor: colors.outlineVariant,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: colors.onSurface,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Cancel"
                  onPress={() => setNameModalOpen(false)}
                  variant="secondary"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Save" onPress={saveName} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceContainerLowest,
        padding: 14,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.outlineVariant,
      }}
    >
      <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>{value}</Text>
      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        color: colors.onSurfaceVariant,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        marginLeft: 4,
        marginBottom: 8,
        marginTop: 8,
      }}
    >
      {children}
    </Text>
  );
}

function MenuCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        marginBottom: 8,
      }}
    >
      {children}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.outlineVariant,
      }}
    >
      <MaterialCommunityIcons name={icon} size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.onSurface, fontSize: 14, fontWeight: '600' }}>{label}</Text>
        {value && (
          <Text
            style={{ color: colors.onSurfaceVariant, fontSize: 12, marginTop: 1 }}
            numberOfLines={1}
          >
            {value}
          </Text>
        )}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.onSurfaceMuted}
      />
    </TouchableOpacity>
  );
}
