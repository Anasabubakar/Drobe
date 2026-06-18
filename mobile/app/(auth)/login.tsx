import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-16">
        <View className="items-center mb-12">
          <Text className="text-primary text-4xl font-black tracking-tighter">DROBE</Text>
        </View>

        <View className="items-center mb-8">
          <Text className="text-headline-lg font-bold text-on-surface text-center text-3xl mb-2">Welcome Back</Text>
          <Text className="text-on-surface-variant text-center text-lg">Sign in to your curated wardrobe.</Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold ml-1">Email Address</Text>
            <TextInput
              className="w-full h-14 px-5 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-on-surface"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between items-center px-1">
              <Text className="text-on-surface-variant uppercase tracking-widest text-xs font-semibold">Password</Text>
              <TouchableOpacity>
                <Text className="text-primary text-xs font-semibold">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="w-full h-14 px-5 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-on-surface"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View className="bg-error-container p-4 rounded-2xl">
              <Text className="text-error text-center font-medium">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="w-full h-14 bg-primary rounded-2xl items-center justify-center mt-4 shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="items-center mt-8">
          <Text className="text-on-surface-variant text-base">
            New to DROBE?{' '}
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-primary font-bold">Create an account</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
