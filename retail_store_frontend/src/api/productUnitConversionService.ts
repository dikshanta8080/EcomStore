import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { ProductUnitConversion, ProductUnitConversionRequest } from '../types/unit';

export const productUnitConversionService = {
  async getConversions(productId: number): Promise<ProductUnitConversion[]> {
    const res = await apiClient.get<ApiResponse<ProductUnitConversion[]>>(
      `/products/${productId}/conversions`
    );
    return res.data.data || [];
  },

  async addConversion(
    productId: number,
    data: ProductUnitConversionRequest
  ): Promise<ProductUnitConversion> {
    const res = await apiClient.post<ApiResponse<ProductUnitConversion>>(
      `/products/${productId}/conversions`,
      data
    );
    return res.data.data;
  },

  async updateConversion(
    productId: number,
    conversionId: number,
    data: ProductUnitConversionRequest
  ): Promise<ProductUnitConversion> {
    const res = await apiClient.put<ApiResponse<ProductUnitConversion>>(
      `/products/${productId}/conversions/${conversionId}`,
      data
    );
    return res.data.data;
  },

  async deleteConversion(productId: number, conversionId: number): Promise<string> {
    const res = await apiClient.delete<ApiResponse<string>>(
      `/products/${productId}/conversions/${conversionId}`
    );
    return res.data.message || 'Conversion deleted successfully';
  },
};
