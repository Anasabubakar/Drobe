import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <View className="items-center mb-10">
        <View className="w-28 h-28 rounded-full bg-surface-container items-center justify-center border-4 border-surface-container-highest mb-4">
          {loading ? (
            <ActivityIndicator color="#e75a66" />
          ) : (
            <Text className="text-3xl font-bold text-primary">{initials}</Text>
          )}
        </View>
        <Text className="text-on-surface text-2xl font-bold">{displayName}</Text>
        <Text className="text-on-surface-variant">{user?.email}</Text>
      </View>

      <View className="flex-row justify-between gap-4 mb-10">
        <View className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm border border-outline-variant/10">
          <Text className="text-primary text-2xl font-bold">0</Text>
          <Text className="text-on-surface-variant text-xs uppercase">Items</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm border border-outline-variant/10">
          <Text className="text-primary text-2xl font-bold">0</Text>
          <Text className="text-on-surface-variant text-xs uppercase">Outfits</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-2xl items-center shadow-sm border border-outline-variant/10">
          <Text className="text-primary text-2xl font-bold">0</Text>
          <Text className="text-on-surface-variant text-xs uppercase">Collections</Text>
        </View>
      </View>

      <View className="space-y-4">
        <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold ml-2">Preferences</Text>
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          {['Wardrobe Preferences', 'Connected Devices', 'Account Settings'].map((item, i) => (
            <TouchableOpacity 
              key={item} 
              className={`flex-row items-center justify-between p-4 ${i < 2 ? 'border-b border-surface-container-highest' : ''}`}
            >
              <Text className="text-on-surface font-medium">{item}</Text>
              <Text className="text-outline-variant">→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleSignOut}
          className="py-5 items-center"
        >
          <Text className="text-primary font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
