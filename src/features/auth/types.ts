export type UserRole = 'owner' | 'accountant';

export interface AppUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  branchIds?: string[];
}
