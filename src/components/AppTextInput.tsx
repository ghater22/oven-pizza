import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppTextInput({ label, error, ...inputProps }: AppTextInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-right font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#B8A99B"
        className={`h-14 rounded-2xl border px-4 text-right font-cairo text-base text-text-primary dark:text-text-primary-dark ${
          error ? 'border-danger dark:border-danger-dark' : 'border-border dark:border-border-dark'
        } bg-surface dark:bg-surface-dark`}
        style={{ writingDirection: 'rtl' }}
        {...inputProps}
      />
      {error ? (
        <Text className="mt-1 font-cairo text-xs text-danger dark:text-danger-dark">{error}</Text>
      ) : null}
    </View>
  );
}
