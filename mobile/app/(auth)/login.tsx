import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { colors } from '../../lib/theme';

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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email above first');
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setError('Password reset link sent to your email');
    } catch (err: any) {
      setError(err.message ?? 'Could not send reset email');
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Logo size={40} />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                color: colors.onSurface,
                fontSize: 28,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              Pick today's look in under 10 seconds.
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <TextField
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity onPress={handleResetPassword} style={{ alignSelf: 'flex-end' }}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {error && (
              <View
                style={{
                  backgroundColor: colors.errorContainer,
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: colors.error, textAlign: 'center', fontSize: 13 }}>
                  {error}
                </Text>
              </View>
            )}

            <Button label="Sign In" onPress={handleLogin} loading={loading} size="lg" />
          </View>

          <View style={{ alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>New to Drobe? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
