import { apiClient } from './client';
import type { ApiResponse, PagedResponse } from '../types/api';
import type { SaleRequest, SaleResponse, SaleQueryParams } from '../types/sale';

export const saleService = {
  async createSale(request: SaleRequest): Promise<SaleResponse> {
    const res = await apiClient.post<ApiResponse<SaleResponse>>('/sales', request);
    return res.data.data;
  },

  async getSaleById(id: number): Promise<SaleResponse> {
    const res = await apiClient.get<ApiResponse<SaleResponse>>(`/sales/${id}`);
    return res.data.data;
  },

  async getAllSales(params?: SaleQueryParams): Promise<PagedResponse<SaleResponse>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'createdAt',
      direction: params?.direction ?? 'desc',
    };

    if (params?.search?.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    if (params?.minTotal !== undefined && params?.minTotal !== null && !isNaN(params.minTotal)) {
      queryParams.minTotal = params.minTotal;
    }
    if (params?.maxTotal !== undefined && params?.maxTotal !== null && !isNaN(params.maxTotal)) {
      queryParams.maxTotal = params.maxTotal;
    }
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }

    const res = await apiClient.get<ApiResponse<PagedResponse<SaleResponse>>>('/sales', {
      params: queryParams,
    });
    return res.data.data;
  },

  async cancelSale(id: number): Promise<SaleResponse> {
    const res = await apiClient.post<ApiResponse<SaleResponse>>(`/sales/${id}/cancel`);
    return res.data.data;
  },
};
