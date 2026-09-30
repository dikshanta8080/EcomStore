import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../components/common/Modal';
import type { InventoryMovementRequest, MovementType } from '../../types/inventory';
import type { Product } from '../../types/product';
import type { Unit } from '../../types/unit';
import { productUnitConversionService } from '../../api/productUnitConversionService';
import { productService } from '../../api/productService';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, Scale, Search, X, Package, Loader2 } from 'lucide-react';

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

  // Searchable Product Picker State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(!selectedProduct);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // Merge local products, preselected product, and remote search matches
  const allKnownProducts = useMemo(() => {
    const map = new Map<number, Product>();
    if (selectedProduct) map.set(selectedProduct.id, selectedProduct);
    products.forEach((p) => map.set(p.id, p));
    remoteProducts.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [products, remoteProducts, selectedProduct]);

  const currentProduct = allKnownProducts.find((p) => p.id === Number(productId));
  const currentStock = currentProduct?.stock ?? 0;
  const baseUnitSymbol = currentProduct?.baseUnitSymbol || 'Units';
  const baseUnitPrice = currentProduct ? Number(currentProduct.price) : 0;

  // Remote Debounced Product Search for catalogs with 1,000+ items
  useEffect(() => {
    const q = productSearchQuery.trim();
    if (q.length < 2) {
      setRemoteProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      try {
        const res = await productService.getAllProducts({ nameOrCategoryName: q, size: 25 });
        setRemoteProducts(res.content || []);
      } catch {
        // Fall back gracefully to local matches
      } finally {
        setIsSearchingRemote(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [productSearchQuery]);

  // Filtered products list for dropdown display
  const displayProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    if (!q) {
      return allKnownProducts.slice(0, 30);
    }
    const filtered = allKnownProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
    return filtered.slice(0, 30);
  }, [allKnownProducts, productSearchQuery]);

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
    if (!productId || !currentProduct) {
      setError('Please search and select a product');
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Movement Type Toggle */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Movement Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMovementType('IN')}
            className={`flex items-center justify-center gap-1.5 rounded-md p-2.5 text-xs font-semibold transition-colors border ${
              movementType === 'IN'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
            Stock IN (Receive)
          </button>
          <button
            type="button"
            onClick={() => setMovementType('OUT')}
            className={`flex items-center justify-center gap-1.5 rounded-md p-2.5 text-xs font-semibold transition-colors border ${
              movementType === 'OUT'
                ? 'border-rose-600 bg-rose-50 text-rose-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
            Stock OUT (Dispatch)
          </button>
        </div>
      </div>

      {/* Searchable Product Picker */}
      <div>
        {currentProduct && !isSearchOpen ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Selected Product <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(true);
                  setProductSearchQuery('');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
              >
                <Search className="h-3 w-3" />
                Change Product
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-md bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {currentProduct.name}
                    </span>
                    <span className="font-mono text-[10px] rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 font-medium text-slate-700 dark:text-slate-300">
                      {currentProduct.sku}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{currentProduct.categoryName || 'General Category'}</span>
                    <span>•</span>
                    <span>
                      In Stock: <strong className="font-mono text-slate-800 dark:text-slate-200">{currentStock} {baseUnitSymbol}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Base Price: <strong className="font-mono text-slate-800 dark:text-slate-200">Rs. {Number(currentProduct.price).toFixed(2)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Search & Select Product <span className="text-rose-500">*</span>
              </label>
              {currentProduct && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Keep current ({currentProduct.sku})
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Type name, SKU, or category to search across 1000+ products..."
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8.5 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none shadow-2xs"
              />
              {productSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Results Popover / List */}
            <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-md">
              {isSearchingRemote && (
                <div className="p-2.5 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/40">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>Searching product catalog...</span>
                </div>
              )}

              {displayProducts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No products found matching "{productSearchQuery}".
                </div>
              ) : (
                displayProducts.map((p) => {
                  const isSelected = p.id === Number(productId);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProductId(p.id);
                        setCustomPrice('');
                        setIsSearchOpen(false);
                        setError(null);
                      }}
                      className={`w-full text-left p-2.5 flex items-center justify-between text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                        isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 px-1.5 py-0.2 rounded">
                            {p.sku}
                          </span>
                          {p.categoryName && (
                            <span className="text-[10px] text-slate-400">
                              ({p.categoryName})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-mono">
                          Rs. {Number(p.price).toFixed(2)} per {p.baseUnitSymbol || 'unit'}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            (p.stock ?? 0) <= 0
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : (p.stock ?? 0) <= 10
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {p.stock ?? 0} {p.baseUnitSymbol || 'units'}
                        </span>
                        {isSelected && (
                          <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                            Selected ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Unit & Quantity Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
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
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none disabled:opacity-50"
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
          <label className="block text-xs font-medium text-slate-700 mb-1">
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
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Unit Conversion Impact */}
      {selectedUnitOption && (
        <div className="rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-500">
              <Scale className="h-3 w-3" />
              Factor: 1 {selectedUnitOption.unitSymbol} = {conversionFactor} {baseUnitSymbol}
            </span>
            <span className="font-mono font-semibold text-slate-900">
              {movementType === 'IN' ? '+' : '-'}
              {calculatedBaseQuantity.toFixed(2)} {baseUnitSymbol}
            </span>
          </div>
        </div>
      )}

      {/* Custom Unit Price */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-slate-700">
            Unit Price (Rs. per {selectedUnitOption?.unitSymbol || 'unit'})
          </label>
          {customPrice !== '' && (
            <button
              type="button"
              onClick={() => setCustomPrice('')}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              Reset to default (Rs. {defaultUnitPrice.toFixed(2)})
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
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      {/* Summary Total Box */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Converted Base Stock:</span>
          <span className="font-semibold text-slate-900 font-mono">
            {calculatedBaseQuantity.toFixed(2)} {baseUnitSymbol}
          </span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
          <span>Total Movement Value:</span>
          <span className="font-mono text-indigo-600 text-sm">Rs. {totalAmount}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5 mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isConversionsLoading}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
            movementType === 'IN'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          {isLoading && (
            <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      title="Record Stock Movement"
      subtitle="Stock transactions with unit conversion and cost audit"
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
