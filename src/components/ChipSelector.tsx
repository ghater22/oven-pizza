import { Pressable, ScrollView, Text, View } from 'react-native';

interface ChipSelectorProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function ChipSelector({ label, options, value, onChange }: ChipSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityLabel={option}
              className={`rounded-full px-4 py-2 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`font-cairo-medium text-sm ${
                  active ? 'text-white' : 'text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
