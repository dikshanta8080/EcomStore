import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiResponse<Record<string, string> | string | null>>;
    const responseData = axiosErr.response?.data;

    if (responseData) {
      // Check if data contains validation errors map { fieldName: "error" }
      if (responseData.data && typeof responseData.data === 'object') {
        const fieldErrors = Object.entries(responseData.data)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        return fieldErrors || responseData.message || 'Validation error occurred';
      }
      if (responseData.message) {
        return responseData.message;
      }
    }

    if (axiosErr.message === 'Network Error') {
      return 'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.';
    }

    return axiosErr.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
