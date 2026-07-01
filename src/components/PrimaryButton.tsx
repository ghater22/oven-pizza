import { ActivityIndicator, Pressable, Text } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-14 flex-row items-center justify-center rounded-2xl ${
        isPrimary ? 'bg-primary dark:bg-primary-dark' : 'bg-transparent border border-primary dark:border-primary-dark'
      } ${disabled || loading ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFF8F1' : '#D64535'} />
      ) : (
        <Text
          className={`font-cairo-semibold text-base ${
            isPrimary ? 'text-white' : 'text-primary dark:text-primary-dark'
          }`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
