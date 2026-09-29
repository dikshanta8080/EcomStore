import { apiClient } from './client';
import type { ApiResponse, PagedResponse } from '../types/api';
import type { Product, ProductCreateRequest, ProductUpdateRequest, ProductQueryParams, ProductSummary } from '../types/product';

export const productService = {
  async getAllProducts(params?: ProductQueryParams): Promise<PagedResponse<Product>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'id',
      direction: params?.direction ?? 'asc',
    };

    if (params?.nameOrCategoryName?.trim()) {
      queryParams.nameOrCategoryName = params.nameOrCategoryName.trim();
    }
    if (params?.sku?.trim()) {
      queryParams.sku = params.sku.trim();
    }
    if (params?.categoryId !== undefined && params?.categoryId !== null && params.categoryId > 0) {
      queryParams.categoryId = params.categoryId;
    }
    if (params?.minPrice !== undefined && params?.minPrice !== null && !isNaN(params.minPrice)) {
      queryParams.minPrice = params.minPrice;
    }
    if (params?.maxPrice !== undefined && params?.maxPrice !== null && !isNaN(params.maxPrice)) {
      queryParams.maxPrice = params.maxPrice;
    }
    if (params?.minStock !== undefined && params?.minStock !== null && !isNaN(params.minStock)) {
      queryParams.minStock = params.minStock;
    }
    if (params?.maxStock !== undefined && params?.maxStock !== null && !isNaN(params.maxStock)) {
      queryParams.maxStock = params.maxStock;
    }
    if (params?.active !== undefined) {
      queryParams.active = params.active ? 'true' : 'false';
    }

    const res = await apiClient.get<ApiResponse<PagedResponse<Product>>>('/products', {
      params: queryParams,
    });
    return res.data.data;
  },

  async getProductSummary(): Promise<ProductSummary> {
    const res = await apiClient.get<ApiResponse<ProductSummary>>('/products/summary');
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

  async restoreProduct(id: number): Promise<Product> {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}/restore`);
    return res.data.data;
  },

  async seedSampleData(): Promise<string> {
    const res = await apiClient.post<ApiResponse<string>>('/products/seed');
    return res.data.message || 'Sample data seeded successfully';
  },
};
