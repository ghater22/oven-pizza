import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { AppTextInput } from '@/src/components/AppTextInput';
import { PizzaOvenLogo } from '@/src/components/PizzaOvenLogo';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { getAuthErrorMessage, signIn } from '@/src/firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      const hasFirebaseCode = Boolean((err as { code?: string })?.code);
      setError(
        hasFirebaseCode ? getAuthErrorMessage(err) : ((err as Error)?.message ?? getAuthErrorMessage(err))
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-background-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
        <View className="mb-10 items-center">
          <PizzaOvenLogo size={110} />
          <Text className="mt-4 font-cairo-bold text-2xl text-text-primary dark:text-text-primary-dark">
            بيتزا الفرن
          </Text>
          <Text className="mt-1 font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
            لوحة تحكم المالك
          </Text>
        </View>

        <AppTextInput
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="owner@example.com"
        />
        <AppTextInput
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
          placeholder="••••••••"
        />

        {error ? (
          <Text className="mb-4 text-center font-cairo text-sm text-danger dark:text-danger-dark">
            {error}
          </Text>
        ) : null}

        <PrimaryButton label="تسجيل الدخول" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
