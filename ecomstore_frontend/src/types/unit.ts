export type UnitType = 'WEIGHT' | 'VOLUME' | 'COUNT' | 'OTHER';

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  unitType: UnitType;
}

export interface UnitRequest {
  name: string;
  symbol: string;
  unitType: UnitType;
}

export interface ProductUnitConversion {
  id: number;
  productId: number;
  productName?: string;
  unitId: number;
  unitName: string;
  unitSymbol: string;
  unitType: UnitType;
  conversionFactor: number;
  active: boolean;
}

export interface ProductUnitConversionRequest {
  unitId: number;
  conversionFactor: number;
  active?: boolean;
}
