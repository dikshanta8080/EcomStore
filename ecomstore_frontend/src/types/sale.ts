import type { PaginationParams } from './api';

export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  discountAmount?: number;
  saleItems: SaleItemRequest[];
}

export interface SaleItemResponse {
  id?: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  itemTax: number;
}

export interface SaleResponse {
  id: number;
  invoiceNumber: string;
  status: SaleStatus;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
  createdAt: string;
  saleItems: SaleItemResponse[];
}

export interface SaleFilterParams {
  search?: string;
  status?: SaleStatus;
  minTotal?: number;
  maxTotal?: number;
  startDate?: string;
  endDate?: string;
}

export type SaleQueryParams = PaginationParams & SaleFilterParams;
