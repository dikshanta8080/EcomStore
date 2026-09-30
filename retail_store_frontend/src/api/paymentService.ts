import { apiClient } from './client';
import type { ApiResponse, PagedResponse } from '../types/api';
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentQueryParams,
  PaymentSummary,
} from '../types/payment';

export const paymentService = {
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const res = await apiClient.post<ApiResponse<PaymentResponse>>('/payments', request);
    return res.data.data;
  },

  async getPaymentBySaleId(saleId: number): Promise<PaymentResponse> {
    const res = await apiClient.get<ApiResponse<PaymentResponse>>(`/payments/sale/${saleId}`);
    return res.data.data;
  },

  async getAllPayments(params?: PaymentQueryParams): Promise<PagedResponse<PaymentResponse>> {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort ?? 'createdAt',
      direction: params?.direction ?? 'desc',
    };

    if (params?.search?.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.saleId) {
      queryParams.saleId = params.saleId;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    if (params?.paymentMethod) {
      queryParams.paymentMethod = params.paymentMethod;
    }
    if (params?.minAmount !== undefined && params?.minAmount !== null && !isNaN(params.minAmount)) {
      queryParams.minAmount = params.minAmount;
    }
    if (params?.maxAmount !== undefined && params?.maxAmount !== null && !isNaN(params.maxAmount)) {
      queryParams.maxAmount = params.maxAmount;
    }
    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }
    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }

    const res = await apiClient.get<ApiResponse<PagedResponse<PaymentResponse>>>('/payments', {
      params: queryParams,
    });
    return res.data.data;
  },

  async getPaymentSummary(): Promise<PaymentSummary> {
    const res = await apiClient.get<ApiResponse<PaymentSummary>>('/payments/summary');
    return res.data.data;
  },
};
