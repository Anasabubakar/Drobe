import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Logo } from '../../components/Logo';
import { Screen } from '../../components/Screen';
import { colors } from '../../lib/theme';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Verify your email',
          'We sent a confirmation link to ' + email.trim() + '. Verify, then sign in.'
        );
        router.replace('/(auth)/login');
      }
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed');
    } finally {
      setLoading(false);
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
              The art of dressing
            </Text>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontSize: 15,
                textAlign: 'center',
              }}
            >
              Curate your personal style with ease.
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <TextField
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
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
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />

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

            <Button label="Create Account" onPress={handleSignup} loading={loading} size="lg" />
          </View>

          <View
            style={{
              alignItems: 'center',
              marginTop: 24,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>Already a member? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
