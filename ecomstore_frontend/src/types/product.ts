import type { ProductUnitConversion } from './unit';

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  stock: number;
  baseUnitId?: number;
  baseUnitName?: string;
  baseUnitSymbol?: string;
  conversions?: ProductUnitConversion[];
}

export interface ProductCreateRequest {
  name: string;
  sku: string;
  description: string;
  price: number;
  categoryId: number;
  baseUnitId: number;
}

export interface ProductUpdateRequest {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  baseUnitId?: number;
}
