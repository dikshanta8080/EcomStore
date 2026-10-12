import { apiClient } from './client';
import type { TenantUser, CreateTenantUserPayload, UserStatus } from '../types/auth';

export const tenantUserService = {
  async getUsers(tenantId?: number): Promise<TenantUser[]> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.get<TenantUser[]>('/tenant/users', { params });
    return response.data;
  },

  async createUser(payload: CreateTenantUserPayload, tenantId?: number): Promise<TenantUser> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.post<TenantUser>('/tenant/users', payload, { params });
    return response.data;
  },

  async updateUserStatus(id: number, status: UserStatus, tenantId?: number): Promise<TenantUser> {
    const params = tenantId ? { tenantId } : {};
    const response = await apiClient.patch<TenantUser>(`/tenant/users/${id}/status`, { userStatus: status }, { params });
    return response.data;
  },
};
