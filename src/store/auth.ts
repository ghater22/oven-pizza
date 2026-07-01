import type { User } from 'firebase/auth';
import { create } from 'zustand';

import type { AppUserProfile } from '@/src/features/auth/types';

interface AuthState {
  user: User | null;
  profile: AppUserProfile | null;
  initializing: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: AppUserProfile | null) => void;
  setInitializing: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  initializing: true,
  error: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (initializing) => set({ initializing }),
  setError: (error) => set({ error }),
}));
