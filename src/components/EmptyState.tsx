import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="mb-2 text-center font-cairo-semibold text-lg text-text-primary dark:text-text-primary-dark">
        {title}
      </Text>
      {description ? (
        <Text className="text-center font-cairo text-sm text-text-secondary dark:text-text-secondary-dark">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
