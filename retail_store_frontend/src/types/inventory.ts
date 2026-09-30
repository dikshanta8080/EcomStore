export type MovementType = 'IN' | 'OUT';

export interface InventoryMovement {
  id: number;
  movementType: MovementType;
  quantity: number;
  unitId?: number;
  unitName?: string;
  unitSymbol?: string;
  baseQuantity: number;
  baseUnitId?: number;
  baseUnitName?: string;
  baseUnitSymbol?: string;
  conversionFactor?: number;
  productId: number;
  productName: string;
  inventoryId: number;
  categoryId: number;
  categoryName: string;
  unitPrice: number;
  totalAmount: number;
  movementDate?: string;
}

export interface InventoryMovementRequest {
  productId: number;
  movementType: MovementType;
  quantity: number;
  unitId: number;
  unitPrice?: number;
}

export interface InventoryMovementFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  search?: string;
  productId?: number;
  categoryId?: number;
  movementType?: MovementType;
  unitId?: number;
  minQuantity?: number;
  maxQuantity?: number;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  startDate?: string;
  endDate?: string;
}
