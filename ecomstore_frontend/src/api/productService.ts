import { apiClient } from './client';
import type { ApiResponse, PagedResponse, PaginationParams } from '../types/api';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../types/product';

export const productService = {
  async getAllProducts(params?: PaginationParams): Promise<PagedResponse<Product>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<Product>>>('/products', {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? 'id',
        direction: params?.direction ?? 'asc',
      },
    });
    return res.data.data;
  },

  async getProductById(id: number): Promise<Product> {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  async createProduct(request: ProductCreateRequest): Promise<Product> {
    const res = await apiClient.post<ApiResponse<Product>>('/products', request);
    return res.data.data;
  },

  async updateProduct(id: number, request: ProductUpdateRequest): Promise<Product> {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, request);
    return res.data.data;
  },

  async deleteProduct(id: number): Promise<Product> {
    const res = await apiClient.delete<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
};
