import React, { useState } from 'react';
import {
  Search,
  ArrowLeftRight,
  Package,
  X
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

  // Backend aggregate metrics
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Warehouse Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time on-hand quantities, identify shortages, and record restock intakes
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Stocked Units:{' '}
          <span className="font-mono font-bold text-slate-900">
            {Number(totalStockUnits).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setStockFilter('ALL')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            stockFilter === 'ALL'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All Items ({totalProducts})
        </button>

        <button
          onClick={() => setStockFilter('IN_STOCK')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            stockFilter === 'IN_STOCK'
              ? 'border-emerald-600 text-emerald-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          In Stock ({inStockCount})
        </button>

        <button
          onClick={() => setStockFilter('LOW_STOCK')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            stockFilter === 'LOW_STOCK'
              ? 'border-amber-500 text-amber-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Low Stock ({lowStockCount})
        </button>

        <button
          onClick={() => setStockFilter('OUT_OF_STOCK')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            stockFilter === 'OUT_OF_STOCK'
              ? 'border-rose-600 text-rose-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Out of Stock ({outOfStockCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching stock levels..." />
        ) : filteredProducts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm ? 'No products match search' : 'No items found in selected filter'}
              description="Try adjusting your keyword or switch stock filter tabs."
              icon={<Package className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{p.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.categoryName || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      Rs. {Number(p.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">
                        {p.stock} {p.baseUnitSymbol || ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenMovementModalForProduct(p)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Record Stock Movement"
                      >
                        <ArrowLeftRight className="h-3 w-3 text-slate-500" />
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
