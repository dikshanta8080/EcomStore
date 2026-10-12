import { apiClient } from './client';
import type { LoginResponse, UserSummary } from '../types/auth';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  async getCurrentUser(): Promise<UserSummary> {
    const response = await apiClient.get<UserSummary>('/auth/me');
    return response.data;
  },
};
