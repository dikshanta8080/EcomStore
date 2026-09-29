import React from 'react';
import {
  Package,
  FolderTree,
  Boxes,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react';
import type { Product, ProductSummary } from '../../types/product';
import type { Category } from '../../types/category';
import type { InventoryMovement } from '../../types/inventory';
import type { NavTab } from '../../components/layout/Sidebar';
import { MovementTypeBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface DashboardPageProps {
  products: Product[];
  categories: Category[];
  recentMovements: InventoryMovement[];
  summary?: ProductSummary | null;
  isLoading: boolean;
  onNavigate: (tab: NavTab) => void;
  onOpenCreateProduct: () => void;
  onOpenCreateCategory: () => void;
  onOpenCreateMovement: () => void;
  onOpenMovementForProduct: (product: Product) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  categories,
  recentMovements,
  summary,
  isLoading,
  onNavigate,
  onOpenCreateProduct,
  onOpenCreateCategory,
  onOpenCreateMovement,
  onOpenMovementForProduct,
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard metrics..." size="lg" />;
  }

  const totalProducts = summary ? summary.totalProducts : products.length;
  const totalCategories = categories.length;
  const totalStockUnits = summary ? summary.totalStockUnits : products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10);
  const outOfStockProducts = products.filter((p) => (p.stock ?? 0) <= 0);
  const attentionCount = summary
    ? summary.lowStockCount + summary.outOfStockCount
    : lowStockProducts.length + outOfStockProducts.length;
  const healthyStockCount = summary
    ? summary.healthyStockCount
    : products.filter((p) => (p.stock ?? 0) > 10).length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <TrendingUp className="h-3.5 w-3.5" /> Live Store Insights
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome to EcomStore Admin
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Monitor real-time inventory, manage product listings, track stock movements, and resolve inventory shortages across your catalog.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenCreateProduct}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-indigo-600" />
              New Product
            </button>
            <button
              onClick={onOpenCreateCategory}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              <FolderTree className="h-4 w-4 text-indigo-300" />
              New Category
            </button>
            <button
              onClick={onOpenCreateMovement}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              <ArrowLeftRight className="h-4 w-4 text-indigo-300" />
              Record Movement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Products
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {totalProducts}
            </span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
              Catalog <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Total Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Categories
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {totalCategories}
            </span>
            <span className="text-xs font-semibold text-violet-600 flex items-center gap-0.5">
              Taxonomy <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Total Inventory Units */}
        <div
          onClick={() => onNavigate('inventory')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Warehouse Stock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {totalStockUnits.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              Inventory <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div
          onClick={() => onNavigate('inventory')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low / Out of Stock
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-700 font-mono">
              {attentionCount}
            </span>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
              Attention <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Movements Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Inventory Movements
              </h3>
              <p className="text-xs text-slate-500">Latest stock IN and OUT transactions</p>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No inventory movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Qty</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentMovements.slice(0, 5).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <MovementTypeBadge type={m.movementType} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-44">
                          {m.productName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          ID: #{m.productId}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono font-bold text-xs text-slate-800">
                        {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-xs text-slate-900">
                        ${Number(m.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{formatDate(m.movementDate)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right (1 col): Inventory Health & Low Stock Action List */}
        <div className="space-y-6">
          {/* Inventory Health Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Inventory Health
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Threshold: ≤ 10 units alert</p>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>In Stock (&gt;10 units)</span>
                  <span className="font-mono text-emerald-700">{healthyStockCount} items</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${totalProducts ? (healthyStockCount / totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Low Stock (1-10 units)</span>
                  <span className="font-mono text-amber-700">{lowStockProducts.length} items</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${totalProducts ? (lowStockProducts.length / totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Out of Stock (0 units)</span>
                  <span className="font-mono text-rose-700">{outOfStockProducts.length} items</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${totalProducts ? (outOfStockProducts.length / totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Items Requiring Restock */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Needs Restocking
                </h4>
              </div>
              <div className="mt-3 space-y-2.5">
                {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-2xs ring-1 ring-slate-200/60"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <button
                      onClick={() => onOpenMovementForProduct(p)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 transition-colors"
                    >
                      Restock ({p.stock ?? 0})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
