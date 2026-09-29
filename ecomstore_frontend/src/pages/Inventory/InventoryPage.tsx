import React, { useState } from 'react';
import {
  Boxes,
  Search,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';
import type { Product, ProductSummary } from '../../types/product';
import { StockBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface InventoryPageProps {
  products: Product[];
  summary?: ProductSummary | null;
  isLoading: boolean;
  onOpenMovementModalForProduct: (product: Product) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products,
  summary,
  isLoading,
  onOpenMovementModalForProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Backend aggregate metrics (with fallback to client array)
  const totalProducts = summary ? summary.totalProducts : products.length;
  const totalStockUnits = summary ? summary.totalStockUnits : products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const outOfStockCount = summary ? summary.outOfStockCount : products.filter((p) => (p.stock ?? 0) <= 0).length;
  const lowStockCount = summary ? summary.lowStockCount : products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;
  const inStockCount = summary ? summary.healthyStockCount : products.filter((p) => (p.stock ?? 0) > 10).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

    const stock = p.stock ?? 0;
    let matchesStock = true;
    if (stockFilter === 'OUT_OF_STOCK') matchesStock = stock <= 0;
    else if (stockFilter === 'LOW_STOCK') matchesStock = stock > 0 && stock <= 10;
    else if (stockFilter === 'IN_STOCK') matchesStock = stock > 10;

    return matchesSearch && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Units */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tracked Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalProducts}
            </span>
            <span className="text-xs text-slate-400">
              {Number(totalStockUnits).toLocaleString()} units across catalog
            </span>
          </div>
        </div>

        {/* Healthy In Stock */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Healthy Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {inStockCount}
            </span>
            <span className="text-xs text-slate-400">&gt; 10 units</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {lowStockCount}
            </span>
            <span className="text-xs text-slate-400">needs restocking</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Out of Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {outOfStockCount}
            </span>
            <span className="text-xs text-slate-400">zero stock</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search warehouse stock by name, SKU, or category..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setStockFilter('ALL')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              stockFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockFilter('IN_STOCK')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              stockFilter === 'IN_STOCK'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'hover:text-emerald-700'
            }`}
          >
            Healthy ({inStockCount})
          </button>
          <button
            onClick={() => setStockFilter('LOW_STOCK')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              stockFilter === 'LOW_STOCK'
                ? 'bg-amber-500 text-white shadow-2xs font-bold'
                : 'hover:text-amber-700'
            }`}
          >
            Low ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter('OUT_OF_STOCK')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              stockFilter === 'OUT_OF_STOCK'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'hover:text-rose-700'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Calculating warehouse inventory levels..." />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No inventory records matching criteria"
              description="Try changing your search term or stock filter."
              icon={<Boxes className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Base Unit</th>
                  <th className="px-6 py-3.5">Current Stock Level</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const stock = p.stock ?? 0;
                  const stockPercentage = Math.min(100, Math.max(0, (stock / 50) * 100));
                  const baseUnit = p.baseUnitSymbol || 'Units';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 font-medium">
                        {p.sku}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {p.categoryName || 'General'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                          {baseUnit}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-44">
                        <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                          <span className={stock <= 0 ? 'text-rose-600' : stock <= 10 ? 'text-amber-600' : 'text-slate-800'}>
                            {stock} {baseUnit}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Cap: 50+</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              stock <= 0
                                ? 'bg-rose-500'
                                : stock <= 10
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StockBadge stock={p.stock} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenMovementModalForProduct(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                          title="Record Stock Movement for this product"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
