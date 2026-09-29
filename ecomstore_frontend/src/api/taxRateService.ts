import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { TaxRate, TaxRateRequest } from '../types/taxRate';

export const taxRateService = {
  async getAllTaxRates(): Promise<TaxRate[]> {
    const res = await apiClient.get<ApiResponse<TaxRate[]>>('/tax-rates');
    return res.data.data;
  },

  async getTaxRateById(id: number): Promise<TaxRate> {
    const res = await apiClient.get<ApiResponse<TaxRate>>(`/tax-rates/${id}`);
    return res.data.data;
  },

  async createTaxRate(request: TaxRateRequest): Promise<TaxRate> {
    const res = await apiClient.post<ApiResponse<TaxRate>>('/tax-rates', request);
    return res.data.data;
  },

  async updateTaxRate(id: number, request: TaxRateRequest): Promise<TaxRate> {
    const res = await apiClient.put<ApiResponse<TaxRate>>(`/tax-rates/${id}`, request);
    return res.data.data;
  },

  async deleteTaxRate(id: number): Promise<string> {
    const res = await apiClient.delete<ApiResponse<string>>(`/tax-rates/${id}`);
    return res.data.message || 'Tax rate deleted successfully';
  },
};
