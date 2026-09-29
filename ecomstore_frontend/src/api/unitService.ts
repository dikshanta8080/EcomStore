import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Unit, UnitRequest, UnitType } from '../types/unit';

export const unitService = {
  async getAllUnits(unitType?: UnitType): Promise<Unit[]> {
    const params = unitType ? { unitType } : {};
    const res = await apiClient.get<ApiResponse<Unit[]>>('/units', { params });
    return res.data.data || [];
  },

  async getUnitById(id: number): Promise<Unit> {
    const res = await apiClient.get<ApiResponse<Unit>>(`/units/${id}`);
    return res.data.data;
  },

  async createUnit(data: UnitRequest): Promise<Unit> {
    const res = await apiClient.post<ApiResponse<Unit>>('/units', data);
    return res.data.data;
  },

  async updateUnit(id: number, data: UnitRequest): Promise<Unit> {
    const res = await apiClient.put<ApiResponse<Unit>>(`/units/${id}`, data);
    return res.data.data;
  },

  async deleteUnit(id: number): Promise<string> {
    const res = await apiClient.delete<ApiResponse<string>>(`/units/${id}`);
    return res.data.message || 'Unit deleted successfully';
  },
};
