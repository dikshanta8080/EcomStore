export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'TENANT_ADMIN' 
  | 'INVENTORY_MANAGER' 
  | 'ACCOUNTANT' 
  | 'CASHIER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  userStatus: UserStatus;
  tenantId?: number | null;
  tenantSlug?: string | null;
  schemaName?: string | null;
  companyName?: string | null;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface Tenant {
  id: number;
  companyName: string;
  tenantSlug: string;
  schemaName: string;
  status: TenantStatus;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  userCount: number;
}

export interface CreateTenantPayload {
  companyName: string;
  tenantSlug: string;
  email: string;
  phone?: string;
  address?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  deactivatedTenants: number;
  totalUsers: number;
}

export interface TenantUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  userStatus: UserStatus;
  tenantId: number;
  createdAt: string;
}

export interface CreateTenantUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'INVENTORY_MANAGER' | 'ACCOUNTANT' | 'CASHIER';
}
