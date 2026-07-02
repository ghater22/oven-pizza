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
      <Text className="mb-1.5 text-right font-cairo-medium text-sm text-text-secondary dark:text-text-secondary-dark">
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-14"
        contentContainerClassName="h-12 items-center gap-2"
      >
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityLabel={option}
              className={`h-11 min-w-24 items-center justify-center rounded-xl px-4 ${
                active
                  ? 'bg-primary dark:bg-primary-dark'
                  : 'border border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
            >
              <Text
                numberOfLines={1}
                className={`text-center font-cairo-medium text-sm ${
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
