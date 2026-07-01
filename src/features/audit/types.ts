export type AuditAction = 'create' | 'update' | 'delete';
export type AuditEntity = 'revenue' | 'expense' | 'branch' | 'product' | 'user';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  label: string;
  branchId?: string | null;
  userId: string;
  createdAt: Date;
}
