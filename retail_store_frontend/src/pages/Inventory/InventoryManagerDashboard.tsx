import React from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  ArrowLeftRight, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Scale, 
  FolderTree
} from 'lucide-react';
import type { Product, ProductSummary } from '../../types/product';
import type { InventoryMovement } from '../../types/inventory';
import type { PagedResponse } from '../../types/api';

interface InventoryManagerDashboardProps {
  productSummary: ProductSummary | null;
  pagedProducts: PagedResponse<Product> | null;
  pagedMovements: PagedResponse<InventoryMovement> | null;
  onOpenQuickProduct: () => void;
  onOpenQuickMovement: () => void;
  onNavigate: (tab: any) => void;
}

export const InventoryManagerDashboard: React.FC<InventoryManagerDashboardProps> = ({
  productSummary,
  pagedProducts,
  pagedMovements,
  onOpenQuickProduct,
  onOpenQuickMovement,
  onNavigate,
}) => {
  const lowStockProducts = (pagedProducts?.content || []).filter(
    (p) => (p.stock ?? 0) <= 10 || p.active === false
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-900/40 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5" />
              Inventory & Logistics Manager
            </span>
            <span className="text-xs text-slate-400">Warehouse Stock Control</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Stock & Catalog Hub</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time stock tracking, inventory movements, low stock alerts, and catalog management.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQuickProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
          <button
            onClick={onOpenQuickMovement}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Log Movement</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{productSummary?.totalProducts ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{productSummary?.totalStockUnits ?? 0} total units in stock</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {productSummary?.healthyStockCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sufficient reserves</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {productSummary?.lowStockCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Requires reorder</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
            <ArrowLeftRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{productSummary?.outOfStockCount ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Immediate action needed</div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Stock Attention Required</h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View All Stock →
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                All stock levels are currently healthy!
              </div>
            ) : (
              lowStockProducts.slice(0, 6).map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-400">SKU: {p.sku} | Cat: {p.categoryName}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Stock: {p.stock ?? 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Movement Log</h3>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View Full History →
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80">
            {(!pagedMovements?.content || pagedMovements.content.length === 0) ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent inventory movements recorded.
              </div>
            ) : (
              pagedMovements.content.slice(0, 6).map((m) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      m.movementType === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.movementType === 'IN' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{m.productName} ({m.movementType})</div>
                      <div className="text-[11px] text-slate-400">
                        {m.movementDate ? new Date(m.movementDate).toLocaleDateString() : 'Recorded'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {m.quantity} {m.unitSymbol}
                    </div>
                    <div className="text-[10px] text-slate-400">Total: ${m.totalAmount?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('products')}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors group cursor-pointer"
        >
          <Package className="w-5 h-5 mx-auto mb-1 text-slate-600 group-hover:text-emerald-600" />
          <div className="text-xs font-semibold text-slate-800">Manage Catalog</div>
        </button>
        <button
          onClick={() => onNavigate('categories')}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors group cursor-pointer"
        >
          <FolderTree className="w-5 h-5 mx-auto mb-1 text-slate-600 group-hover:text-emerald-600" />
          <div className="text-xs font-semibold text-slate-800">Categories</div>
        </button>
        <button
          onClick={() => onNavigate('units')}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors group cursor-pointer"
        >
          <Scale className="w-5 h-5 mx-auto mb-1 text-slate-600 group-hover:text-emerald-600" />
          <div className="text-xs font-semibold text-slate-800">Units & Measures</div>
        </button>
        <button
          onClick={() => onNavigate('inventory')}
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors group cursor-pointer"
        >
          <Boxes className="w-5 h-5 mx-auto mb-1 text-slate-600 group-hover:text-emerald-600" />
          <div className="text-xs font-semibold text-slate-800">Stock Balance</div>
        </button>
      </div>
    </div>
  );
};
