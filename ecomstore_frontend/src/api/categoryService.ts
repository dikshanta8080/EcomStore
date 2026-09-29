import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Category, CategoryRequest } from '../types/category';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data;
  },

  async createCategory(request: CategoryRequest): Promise<Category> {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', request);
    return res.data.data;
  },

  async updateCategory(id: number, request: CategoryRequest): Promise<Category> {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, request);
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<string> {
    const res = await apiClient.delete<ApiResponse<string>>(`/categories/${id}`);
    return res.data.message || 'Category deleted successfully';
  },
};
