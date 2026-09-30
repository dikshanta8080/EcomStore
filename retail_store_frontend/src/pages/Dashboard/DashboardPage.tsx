import React, { useState } from 'react';
import {
  Package,
  FolderTree,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  ArrowRight,
  Percent,
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
import { PaymentsDashboardSection } from './PaymentsDashboardSection';

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
  taxRates: _taxRates,
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
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor catalog metrics, inventory alerts, and recent transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateProduct}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Product
          </button>
          <button
            onClick={onOpenCreateMovement}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-slate-500" />
            Record Movement
          </button>
          <button
            onClick={onOpenCreateCategory}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FolderTree className="h-3.5 w-3.5 text-slate-500" />
            New Category
          </button>
          <button
            onClick={() => {
              setEditingTaxRate(null);
              setIsTaxRateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Percent className="h-3.5 w-3.5 text-slate-500" />
            Tax Rate
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Total Products</span>
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalProducts}</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {totalCategories} categories · {totalStockUnits.toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Healthy Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Healthy Stock (&gt;10 units)</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {healthyStockCount}
            </span>
            <span className="text-[11px] text-slate-400">Normal inventory</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Low Stock (1-10 units)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {lowStockProducts.length}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Restock suggested</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => onNavigate('inventory')}
          className="rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Out of Stock (0 units)</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-600">
              {outOfStockProducts.length}
            </span>
            <span className="text-[11px] text-rose-600 font-medium">Critical shortage</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Movements (Left) and Inventory Health / Restock (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Recent Stock Movements */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Stock Movements</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 5 stock movements recorded</p>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {recentMovements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No inventory movements recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Qty</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentMovements.slice(0, 5).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                          {m.productName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {m.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <MovementTypeBadge type={m.movementType} />
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`} {m.unitName || ''}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        Rs. {Number(m.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(m.movementDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Inventory Health & Restock List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Health progress bar */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Inventory Distribution
            </h3>

            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Healthy Stock</span>
                  <span className="font-mono text-emerald-700">{healthyStockCount} items</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${totalProducts ? (healthyStockCount / totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Low Stock</span>
                  <span className="font-mono text-amber-600">{lowStockProducts.length} items</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${totalProducts ? (lowStockProducts.length / totalProducts) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Out of Stock</span>
                  <span className="font-mono text-rose-600">{outOfStockProducts.length} items</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
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

          {/* Needs Restocking Alert List */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Needs Restocking
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {lowStockProducts.length + outOfStockProducts.length} items
                </span>
              </div>

              <div className="mt-2 divide-y divide-slate-100">
                {[...outOfStockProducts, ...lowStockProducts].slice(0, 4).map((p) => (
                  <div key={p.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Stock: {p.stock ?? 0} {p.baseUnitSymbol || ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenMovementForProduct(p)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
              All stock levels are healthy.
            </div>
          )}
        </div>
      </div>

      {/* Payments and Subpayments Section */}
      <PaymentsDashboardSection />

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
