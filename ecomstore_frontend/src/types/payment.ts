import type { PaginationParams } from './api';

export type PaymentMethod = 'CASH' | 'CARD' | 'ESEWA' | 'KHALTI' | 'MOBILE_BANKING';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_PAID' | 'REFUNDED';

export interface SubPaymentRequest {
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId?: string;
}

export interface PaymentRequest {
  saleId: number;
  subPayments: SubPaymentRequest[];
}

export interface SubPaymentResponse {
  id: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId?: string;
  status: PaymentStatus;
  createdAt?: string;
}

export interface PaymentResponse {
  paymentId: string;
  saleId: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentTime: string;
  subPayments: SubPaymentResponse[];
}

export interface PaymentFilterParams {
  search?: string;
  saleId?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export type PaymentQueryParams = PaginationParams & PaymentFilterParams;

export interface PaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
  cashTotal: number;
  esewaTotal: number;
  khaltiTotal: number;
  cardTotal: number;
  mobileBankingTotal: number;
  methodBreakdown: Record<string, number>;
}
