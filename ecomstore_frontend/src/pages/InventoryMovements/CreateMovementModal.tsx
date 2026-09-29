import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import type { InventoryMovementRequest, MovementType } from '../../types/inventory';
import type { Product } from '../../types/product';
import type { Unit } from '../../types/unit';
import { productUnitConversionService } from '../../api/productUnitConversionService';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, Scale } from 'lucide-react';

interface CreateMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryMovementRequest) => Promise<void>;
  products: Product[];
  units?: Unit[];
  selectedProduct?: Product | null;
  isLoading?: boolean;
}

interface UnitOption {
  unitId: number;
  unitName: string;
  unitSymbol: string;
  conversionFactor: number;
  isBaseUnit: boolean;
}

const CreateMovementContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: InventoryMovementRequest) => Promise<void>;
  products: Product[];
  selectedProduct?: Product | null;
  isLoading?: boolean;
}> = ({ onClose, onSubmit, products, selectedProduct, isLoading = false }) => {
  const [productId, setProductId] = useState<number | ''>(
    selectedProduct?.id || (products.length > 0 ? products[0].id : '')
  );
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [unitId, setUnitId] = useState<number | ''>('');
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [isConversionsLoading, setIsConversionsLoading] = useState(false);
  const [quantity, setQuantity] = useState<string>('1');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const currentProduct = products.find((p) => p.id === Number(productId));
  const currentStock = currentProduct?.stock ?? 0;
  const baseUnitSymbol = currentProduct?.baseUnitSymbol || 'Units';
  const baseUnitPrice = currentProduct ? Number(currentProduct.price) : 0;

  // Fetch conversions when product changes
  useEffect(() => {
    let isCancelled = false;
    async function loadProductUnits() {
      if (!currentProduct) {
        setUnitOptions([]);
        return;
      }

      setIsConversionsLoading(true);
      try {
        const conversions = await productUnitConversionService.getConversions(currentProduct.id);
        if (isCancelled) return;

        const options: UnitOption[] = [];

        // 1. Add base unit if available
        if (currentProduct.baseUnitId) {
          options.push({
            unitId: currentProduct.baseUnitId,
            unitName: currentProduct.baseUnitName || 'Base Unit',
            unitSymbol: currentProduct.baseUnitSymbol || 'unit',
            conversionFactor: 1.0,
            isBaseUnit: true,
          });
        }

        // 2. Add active conversions
        conversions
          .filter((c) => c.active && c.unitId !== currentProduct.baseUnitId)
          .forEach((c) => {
            options.push({
              unitId: c.unitId,
              unitName: c.unitName,
              unitSymbol: c.unitSymbol,
              conversionFactor: Number(c.conversionFactor),
              isBaseUnit: false,
            });
          });

        setUnitOptions(options);

        // Select first available unit option
        if (options.length > 0) {
          setUnitId(options[0].unitId);
        } else if (currentProduct.baseUnitId) {
          setUnitId(currentProduct.baseUnitId);
        }
      } catch {
        // Fallback to base unit only
        if (currentProduct.baseUnitId) {
          setUnitOptions([
            {
              unitId: currentProduct.baseUnitId,
              unitName: currentProduct.baseUnitName || 'Base Unit',
              unitSymbol: currentProduct.baseUnitSymbol || 'unit',
              conversionFactor: 1.0,
              isBaseUnit: true,
            },
          ]);
          setUnitId(currentProduct.baseUnitId);
        }
      } finally {
        if (!isCancelled) {
          setIsConversionsLoading(false);
        }
      }
    }

    loadProductUnits();
    return () => {
      isCancelled = true;
    };
  }, [currentProduct]);

  // Selected unit details
  const selectedUnitOption = unitOptions.find((u) => u.unitId === Number(unitId));
  const conversionFactor = selectedUnitOption?.conversionFactor ?? 1.0;
  const numQuantity = parseFloat(quantity) || 0;
  const calculatedBaseQuantity = numQuantity * conversionFactor;

  // Default unit price based on conversion factor
  const defaultUnitPrice = baseUnitPrice * conversionFactor;
  const effectiveUnitPrice = customPrice !== '' ? parseFloat(customPrice) || 0 : defaultUnitPrice;
  const totalAmount = (effectiveUnitPrice * numQuantity).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Please select a product');
      return;
    }
    if (!unitId) {
      setError('Please select a transaction unit');
      return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (movementType === 'OUT' && calculatedBaseQuantity > currentStock) {
      setError(
        `Cannot dispatch ${numQuantity} ${selectedUnitOption?.unitSymbol} (${calculatedBaseQuantity.toFixed(
          2
        )} ${baseUnitSymbol}). Only ${currentStock} ${baseUnitSymbol} currently available in stock.`
      );
      return;
    }

    try {
      setError(null);
      await onSubmit({
        productId: Number(productId),
        movementType,
        quantity: numQuantity,
        unitId: Number(unitId),
        unitPrice: effectiveUnitPrice,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record movement');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Movement Type Toggle */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Movement Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMovementType('IN')}
            className={`flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all border ${
              movementType === 'IN'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            Stock IN (Receive)
          </button>
          <button
            type="button"
            onClick={() => setMovementType('OUT')}
            className={`flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all border ${
              movementType === 'OUT'
                ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
            Stock OUT (Dispatch)
          </button>
        </div>
      </div>

      {/* Product Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Product <span className="text-rose-500">*</span>
        </label>
        <select
          required
          value={productId}
          onChange={(e) => {
            setProductId(Number(e.target.value));
            setCustomPrice('');
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        >
          <option value="" disabled>Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) — Available: {p.stock} {p.baseUnitSymbol || 'Units'}
            </option>
          ))}
        </select>
      </div>

      {/* Current Stock Banner */}
      {currentProduct && (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
          <span className="text-slate-500">Current In-Stock:</span>
          <span className="font-bold text-slate-800 font-mono text-sm">
            {currentStock} {baseUnitSymbol}
          </span>
        </div>
      )}

      {/* Transaction Unit & Quantity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Transaction Unit <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={unitId}
            onChange={(e) => {
              setUnitId(Number(e.target.value));
              setCustomPrice('');
            }}
            disabled={isConversionsLoading}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:opacity-50"
          >
            {unitOptions.map((opt) => (
              <option key={opt.unitId} value={opt.unitId}>
                {opt.unitSymbol} ({opt.unitName}){' '}
                {opt.isBaseUnit ? '[Base Unit]' : `[1 = ${opt.conversionFactor} ${baseUnitSymbol}]`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Quantity ({selectedUnitOption?.unitSymbol || 'Units'}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            min="0.0001"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono"
          />
        </div>
      </div>

      {/* Unit Conversion Live Calculation Preview */}
      {selectedUnitOption && (
        <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-indigo-600" />
              Stock Impact Calculation:
            </span>
            <span className="font-mono text-indigo-800 font-bold">
              1 {selectedUnitOption.unitSymbol} = {conversionFactor} {baseUnitSymbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-indigo-950 border-t border-indigo-200/50 pt-1.5">
            <span className="text-xs font-medium text-indigo-800">
              {numQuantity} {selectedUnitOption.unitSymbol} converts to:
            </span>
            <span className="font-mono text-base text-indigo-600">
              {movementType === 'IN' ? '+' : '-'}
              {calculatedBaseQuantity.toFixed(2)} {baseUnitSymbol}
            </span>
          </div>
        </div>
      )}

      {/* Custom Unit Price */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Unit Price ($ per {selectedUnitOption?.unitSymbol || 'unit'})
          </label>
          {customPrice !== '' && (
            <button
              type="button"
              onClick={() => setCustomPrice('')}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              Reset to default (${defaultUnitPrice.toFixed(2)})
            </button>
          )}
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          value={customPrice !== '' ? customPrice : defaultUnitPrice ? defaultUnitPrice.toFixed(2) : ''}
          onChange={(e) => setCustomPrice(e.target.value)}
          placeholder={defaultUnitPrice.toFixed(2)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Price per {selectedUnitOption?.unitSymbol || 'unit'}. Does not alter standard price per {baseUnitSymbol}.
        </p>
      </div>

      {/* Summary Total Box */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Transaction Quantity:</span>
          <span className="font-semibold text-slate-900">
            {numQuantity} {selectedUnitOption?.unitSymbol || ''}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Converted Base Stock:</span>
          <span className="font-semibold text-indigo-700">
            {calculatedBaseQuantity.toFixed(2)} {baseUnitSymbol}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Price per {selectedUnitOption?.unitSymbol || 'Unit'}:</span>
          <span className="font-semibold text-slate-900">${effectiveUnitPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
          <span>Total Movement Amount:</span>
          <span className="text-base text-indigo-600">${totalAmount}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isConversionsLoading}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
            movementType === 'IN'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {isLoading && (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Confirm {movementType === 'IN' ? 'Stock IN' : 'Stock OUT'}
        </button>
      </div>
    </form>
  );
};

export const CreateMovementModal: React.FC<CreateMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  selectedProduct,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Inventory Movement"
      subtitle="Stock transactions with flexible unit conversion & accurate price recording"
      maxWidth="md"
    >
      <CreateMovementContent
        key={selectedProduct ? `prod-${selectedProduct.id}` : 'prod-new'}
        onClose={onClose}
        onSubmit={onSubmit}
        products={products}
        selectedProduct={selectedProduct}
        isLoading={isLoading}
      />
    </Modal>
  );
};
