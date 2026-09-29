import { apiClient } from './client';
import type { ApiResponse, PagedResponse, PaginationParams } from '../types/api';
import type { InventoryMovement, InventoryMovementRequest } from '../types/inventory';

export const inventoryService = {
  async getAllMovements(params?: PaginationParams): Promise<PagedResponse<InventoryMovement>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<InventoryMovement>>>('/inventory/movements', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? 'id',
        direction: params?.direction ?? 'desc',
      },
    });
    return res.data.data;
  },

  async getMovementById(id: number): Promise<InventoryMovement> {
    const res = await apiClient.get<ApiResponse<InventoryMovement>>(`/inventory/movements/${id}`);
    return res.data.data;
  },

  async createMovement(request: InventoryMovementRequest): Promise<InventoryMovement> {
    const res = await apiClient.post<ApiResponse<InventoryMovement>>('/inventory/movements', request);
    return res.data.data;
  },

  async deleteMovement(id: number): Promise<InventoryMovement> {
    const res = await apiClient.delete<ApiResponse<InventoryMovement>>(`/inventory/movements/${id}`);
    return res.data.data;
  },
};
