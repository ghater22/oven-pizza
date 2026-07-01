import { Redirect } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { AppTextInput } from '@/src/components/AppTextInput';
import { PizzaOvenLogo } from '@/src/components/PizzaOvenLogo';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { PwaInstallButton } from '@/src/components/PwaInstallButton';
import { getAuthErrorMessage, signIn } from '@/src/firebase/auth';
import { useAuthStore } from '@/src/store/auth';

export default function LoginScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const storeError = useAuthStore((state) => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (user && profile) {
    return <Redirect href="/dashboard" />;
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setLocalError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // التنقل يحدث تلقائيًا أعلاه بمجرد تأكيد وجود الملف الشخصي في authStore
    } catch (err) {
      const hasFirebaseCode = Boolean((err as { code?: string })?.code);
      setLocalError(
        hasFirebaseCode ? getAuthErrorMessage(err) : ((err as Error)?.message ?? getAuthErrorMessage(err))
      );
    } finally {
      setLoading(false);
    }
  }

  const error = localError ?? storeError;

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
        <PwaInstallButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
