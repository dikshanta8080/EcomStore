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
