import { apiClient } from './client';
import type { Tenant, CreateTenantPayload, SuperAdminStats, TenantStatus } from '../types/auth';

export const superAdminService = {
  async getTenants(query?: string): Promise<Tenant[]> {
    const params = query ? { query } : {};
    const response = await apiClient.get<Tenant[]>('/superadmin/tenants', { params });
    return response.data;
  },

  async getTenantById(id: number): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/superadmin/tenants/${id}`);
    return response.data;
  },

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    const response = await apiClient.post<Tenant>('/superadmin/tenants', payload);
    return response.data;
  },

  async updateTenantStatus(id: number, status: TenantStatus): Promise<Tenant> {
    const response = await apiClient.patch<Tenant>(`/superadmin/tenants/${id}/status`, { status });
    return response.data;
  },

  async getStats(): Promise<SuperAdminStats> {
    const response = await apiClient.get<SuperAdminStats>('/superadmin/stats');
    return response.data;
  },
};
