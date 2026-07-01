import { Pressable, ScrollView, Text } from 'react-native';

import { useBranches } from '@/src/hooks/useBranches';
import { useBranchStore } from '@/src/store/branch';

export function BranchSwitcher() {
  const { branches } = useBranches();
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5 pb-3"
    >
      {[{ id: 'all', name: 'كل الفروع' }, ...branches].map((option) => {
        const active = option.id === selectedBranchId;
        return (
          <Pressable
            key={option.id}
            onPress={() => setSelectedBranchId(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.name}
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
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
