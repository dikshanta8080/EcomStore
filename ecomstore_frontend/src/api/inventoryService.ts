import { apiClient } from './client';
import type { ApiResponse, PagedResponse } from '../types/api';
import type { InventoryMovement, InventoryMovementRequest, InventoryMovementFilterParams } from '../types/inventory';

export const inventoryService = {
  async getAllMovements(params?: InventoryMovementFilterParams): Promise<PagedResponse<InventoryMovement>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<InventoryMovement>>>('/inventory/movements', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? 'id',
        direction: params?.direction ?? 'desc',
        search: params?.search || undefined,
        productId: params?.productId || undefined,
        categoryId: params?.categoryId || undefined,
        movementType: params?.movementType || undefined,
        unitId: params?.unitId || undefined,
        minQuantity: params?.minQuantity !== undefined ? params.minQuantity : undefined,
        maxQuantity: params?.maxQuantity !== undefined ? params.maxQuantity : undefined,
        minTotalAmount: params?.minTotalAmount !== undefined ? params.minTotalAmount : undefined,
        maxTotalAmount: params?.maxTotalAmount !== undefined ? params.maxTotalAmount : undefined,
        startDate: params?.startDate || undefined,
        endDate: params?.endDate || undefined,
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
