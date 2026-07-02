import { Pressable, ScrollView, Text } from 'react-native';

import { useBranches } from '@/src/hooks/useBranches';
import { useAuthStore } from '@/src/store/auth';
import { useBranchStore } from '@/src/store/branch';

const ALL_BRANCHES_LABEL = '\u0643\u0644 \u0627\u0644\u0641\u0631\u0648\u0639';

export function BranchSwitcher() {
  const { branches } = useBranches();
  const isAccountant = useAuthStore((state) => state.profile?.role === 'accountant');
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const setSelectedBranchId = useBranchStore((state) => state.setSelectedBranchId);
  const options = isAccountant ? branches : [{ id: 'all', name: ALL_BRANCHES_LABEL }, ...branches];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4 h-14"
      contentContainerClassName="h-14 items-center gap-2 px-5"
    >
      {options.map((option) => {
        const active = option.id === selectedBranchId;
        return (
          <Pressable
            key={option.id}
            onPress={() => setSelectedBranchId(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.name}
            className={`h-11 min-w-32 items-center justify-center rounded-xl px-4 ${
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
              {option.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
