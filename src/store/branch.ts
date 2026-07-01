import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** 'all' يعني عرض إجمالي كل الفروع معًا. */
export type BranchSelection = 'all' | string;

interface BranchState {
  selectedBranchId: BranchSelection;
  setSelectedBranchId: (branchId: BranchSelection) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedBranchId: 'all',
      setSelectedBranchId: (selectedBranchId) => set({ selectedBranchId }),
    }),
    {
      name: 'pizza-oven-selected-branch',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
