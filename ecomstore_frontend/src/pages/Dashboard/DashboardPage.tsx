import React, { useState } from 'react';
import {
  Package,
  FolderTree,
  Boxes,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Percent,
  Receipt,
  Edit2,
  Trash2
} from 'lucide-react';
import type { Product, ProductSummary } from '../../types/product';
import type { Category } from '../../types/category';
import type { InventoryMovement } from '../../types/inventory';
import type { TaxRate, TaxRateRequest } from '../../types/taxRate';
import type { NavTab } from '../../components/layout/Sidebar';
import { MovementTypeBadge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TaxRateFormModal } from '../TaxRates/TaxRateFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

interface DashboardPageProps {
  products: Product[];
  categories: Category[];
  recentMovements: InventoryMovement[];
  taxRates: TaxRate[];
  summary?: ProductSummary | null;
  isLoading: boolean;
  onNavigate: (tab: NavTab) => void;
  onOpenCreateProduct: () => void;
  onOpenCreateCategory: () => void;
  onOpenCreateMovement: () => void;
  onOpenMovementForProduct: (product: Product) => void;
  onCreateTaxRate: (data: TaxRateRequest) => Promise<void>;
  onUpdateTaxRate: (id: number, data: TaxRateRequest) => Promise<void>;
  onDeleteTaxRate: (id: number) => Promise<void>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  categories,
  recentMovements,
  taxRates,
  summary,
  isLoading,
  onNavigate,
  onOpenCreateProduct,
  onOpenCreateCategory,
  onOpenCreateMovement,
  onOpenMovementForProduct,
  onCreateTaxRate,
  onUpdateTaxRate,
  onDeleteTaxRate,
}) => {
  const [isTaxRateModalOpen, setIsTaxRateModalOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [deletingTaxRate, setDeletingTaxRate] = useState<TaxRate | null>(null);
  const [taxRateActionLoading, setTaxRateActionLoading] = useState(false);

  const handleSaveTaxRate = async (data: TaxRateRequest) => {
    setTaxRateActionLoading(true);
    try {
      if (editingTaxRate) {
        await onUpdateTaxRate(editingTaxRate.id, data);
      } else {
        await onCreateTaxRate(data);
      }
      setIsTaxRateModalOpen(false);
      setEditingTaxRate(null);
    } finally {
      setTaxRateActionLoading(false);
    }
  };

  const handleDeleteTaxRateConfirm = async () => {
    if (!deletingTaxRate) return;
    setTaxRateActionLoading(true);
    try {
      await onDeleteTaxRate(deletingTaxRate.id);
      setDeletingTaxRate(null);
    } finally {
      setTaxRateActionLoading(false);
    }
  };

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
            Monitor real-time inventory, manage product listings, track stock movements, configure tax rates, and resolve inventory shortages across your catalog.
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
              onClick={() => {
                setEditingTaxRate(null);
                setIsTaxRateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-[0.98]"
            >
              <Percent className="h-4 w-4 text-indigo-300" />
              New Tax Rate
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-w-0">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate mr-2">
              Total Products
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
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
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate mr-2">
              Categories
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
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

        {/* Tax Rates */}
        <div
          onClick={() => onNavigate('tax-rates')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate mr-2">
              Tax Rates
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {taxRates.length}
            </span>
            <span className="text-xs font-semibold text-cyan-600 flex items-center gap-0.5">
              Rates <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Total Inventory Units */}
        <div
          onClick={() => onNavigate('inventory')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate mr-2">
              Warehouse Stock
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
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
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate mr-2">
              Low / Out Stock
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
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

      {/* Tax Rates Management Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tax Rates & Fiscal Setup
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, modify, and delete sales tax percentages applied across your catalog
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTaxRate(null);
                setIsTaxRateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Tax Rate
            </button>
            <button
              onClick={() => onNavigate('tax-rates')}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Manage Tab <ArrowRight className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>

        {taxRates.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
              <Percent className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Tax Rates Configured</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              You haven't set up any tax rates yet. Create standard or custom rates (e.g. 13% VAT, 5% Reduced) to apply to catalog products.
            </p>
            <button
              onClick={() => {
                setEditingTaxRate(null);
                setIsTaxRateModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add First Tax Rate
            </button>
          </div>
        ) : (
          <div className="p-6 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
              {taxRates.map((tr) => (
                <div
                  key={tr.id}
                  className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between min-w-0"
                >
                  <div className="flex items-start justify-between min-w-0">
                    <div className="min-w-0 mr-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-400">
                        ID #{tr.id}
                      </span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {Number(tr.rate).toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-indigo-600">%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingTaxRate(tr);
                          setIsTaxRateModalOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                        title="Modify / Edit Tax Rate"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingTaxRate(tr)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                        title="Delete Tax Rate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>$100 Item Impact:</span>
                    <span className="font-semibold text-slate-800">
                      +${((100 * Number(tr.rate)) / 100).toFixed(2)} tax
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left (2 cols): Recent Movements Table */}
        <div className="lg:col-span-2 min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Inventory Movements
              </h3>
              <p className="text-xs text-slate-500">Latest stock IN and OUT transactions</p>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No inventory movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto min-w-0">
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
                      <td className="px-6 py-3.5 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate max-w-44" title={m.productName}>
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
        <div className="lg:col-span-1 min-w-0 space-y-6">
          {/* Inventory Health Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs min-w-0">
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
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 shadow-2xs min-w-0">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Needs Restocking
                </h4>
              </div>
              <div className="mt-3 space-y-2.5 min-w-0">
                {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2.5 rounded-xl bg-white p-2.5 shadow-2xs ring-1 ring-slate-200/60 min-w-0 hover:ring-slate-300 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate" title={p.name}>
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-400 truncate">
                          {p.sku}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                          {p.stock ?? 0} in stock
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenMovementForProduct(p)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Rate Form Modal (Add / Edit) */}
      <TaxRateFormModal
        isOpen={isTaxRateModalOpen}
        onClose={() => {
          setIsTaxRateModalOpen(false);
          setEditingTaxRate(null);
        }}
        onSubmit={handleSaveTaxRate}
        taxRate={editingTaxRate}
        isLoading={taxRateActionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTaxRate)}
        onClose={() => setDeletingTaxRate(null)}
        onConfirm={handleDeleteTaxRateConfirm}
        title="Delete Tax Rate"
        message={
          deletingTaxRate
            ? `Are you sure you want to delete tax rate "${deletingTaxRate.rate}%" (ID #${deletingTaxRate.id})? This cannot be undone and will fail if products are currently assigned to it.`
            : ''
        }
        confirmText="Delete Tax Rate"
        variant="danger"
        isLoading={taxRateActionLoading}
      />
    </div>
  );
};
