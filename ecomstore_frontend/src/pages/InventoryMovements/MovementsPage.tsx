import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, Trash2, Calendar, Package, Scale, Search, X } from 'lucide-react';
import type { InventoryMovement, InventoryMovementRequest, MovementType, InventoryMovementFilterParams } from '../../types/inventory';
import type { Product } from '../../types/product';
import type { Unit } from '../../types/unit';
import type { PagedResponse } from '../../types/api';
import { MovementTypeBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CreateMovementModal } from './CreateMovementModal';

interface MovementsPageProps {
  pagedMovements: PagedResponse<InventoryMovement> | null;
  products: Product[];
  units?: Unit[];
  isLoading: boolean;
  filterParams: InventoryMovementFilterParams;
  onFilterChange: (params: InventoryMovementFilterParams) => void;
  onCreateMovement: (data: InventoryMovementRequest) => Promise<void>;
  onDeleteMovement: (id: number) => Promise<void>;
}

export const MovementsPage: React.FC<MovementsPageProps> = ({
  pagedMovements,
  products,
  units,
  isLoading,
  filterParams,
  onFilterChange,
  onCreateMovement,
  onDeleteMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState(filterParams.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMovement, setDeletingMovement] = useState<InventoryMovement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync internal search input if external filterParams changes
  useEffect(() => {
    setSearchTerm(filterParams.search || '');
  }, [filterParams.search]);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((filterParams.search || '') !== searchTerm.trim()) {
        onFilterChange({
          ...filterParams,
          search: searchTerm.trim() || undefined,
          page: 0,
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const movements = pagedMovements?.content || [];

  const handleTypeChange = (type: 'ALL' | MovementType) => {
    onFilterChange({
      ...filterParams,
      movementType: type === 'ALL' ? undefined : type,
      page: 0,
    });
  };

  const handleProductChange = (productIdStr: string) => {
    onFilterChange({
      ...filterParams,
      productId: productIdStr ? Number(productIdStr) : undefined,
      page: 0,
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
    onFilterChange({
      ...filterParams,
      [field]: val || undefined,
      page: 0,
    });
  };

  const handleClearDates = () => {
    onFilterChange({
      ...filterParams,
      startDate: undefined,
      endDate: undefined,
      page: 0,
    });
  };

  const handleDatePreset = (preset: 'today' | '7days' | '30days' | 'month') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let startStr = todayStr;

    if (preset === 'today') {
      startStr = todayStr;
    } else if (preset === '7days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === '30days') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      startStr = d.toISOString().split('T')[0];
    } else if (preset === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      startStr = d.toISOString().split('T')[0];
    }

    onFilterChange({
      ...filterParams,
      startDate: startStr,
      endDate: todayStr,
      page: 0,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      page: 0,
      size: filterParams.size || 10,
      sort: filterParams.sort || 'id',
      direction: filterParams.direction || 'desc',
    });
  };

  const hasActiveFilters = Boolean(
    filterParams.search ||
    filterParams.movementType ||
    filterParams.productId ||
    filterParams.minQuantity !== undefined ||
    filterParams.maxQuantity !== undefined ||
    filterParams.startDate ||
    filterParams.endDate
  );

  const selectedProduct = products.find((p) => p.id === filterParams.productId);

  const handleCreate = async (data: InventoryMovementRequest) => {
    setActionLoading(true);
    try {
      await onCreateMovement(data);
      setIsModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMovement) return;
    setActionLoading(true);
    try {
      await onDeleteMovement(deletingMovement.id);
      setDeletingMovement(null);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Controls & Create Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Movement Type Filter Tabs */}
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => handleTypeChange('ALL')}
              className={`rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                !filterParams.movementType
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Movements
            </button>
            <button
              onClick={() => handleTypeChange('IN')}
              className={`rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                filterParams.movementType === 'IN'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'hover:text-emerald-700'
              }`}
            >
              Stock IN (Receive)
            </button>
            <button
              onClick={() => handleTypeChange('OUT')}
              className={`rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                filterParams.movementType === 'OUT'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'hover:text-rose-700'
              }`}
            >
              Stock OUT (Dispatch)
            </button>
          </div>

          {/* Record Movement Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Record Movement
          </button>
        </div>

        {/* Dynamic Search & Product Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Dynamic Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by product name, SKU, or category..."
              className="w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Product Filter Dropdown */}
          <div className="sm:w-64">
            <select
              value={filterParams.productId || ''}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-2xs cursor-pointer"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Reset all movement filters"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Date Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Date Filter:</span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">From:</label>
              <input
                type="date"
                value={filterParams.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-2xs cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500">To:</label>
              <input
                type="date"
                value={filterParams.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-2xs cursor-pointer"
              />
            </div>

            {(filterParams.startDate || filterParams.endDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-1 py-1 cursor-pointer"
                title="Clear date range"
              >
                <X className="h-3.5 w-3.5" />
                Clear Dates
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => handleDatePreset('today')}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('7days')}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('30days')}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('month')}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              This Month
            </button>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active:
            </span>

            {filterParams.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Search: &ldquo;{filterParams.search}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="hover:text-indigo-900 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterParams.movementType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Type: {filterParams.movementType === 'IN' ? 'Stock IN' : 'Stock OUT'}
                <button
                  type="button"
                  onClick={() => handleTypeChange('ALL')}
                  className="hover:text-slate-900 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedProduct && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Product: {selectedProduct.name} ({selectedProduct.sku})
                <button
                  type="button"
                  onClick={() => handleProductChange('')}
                  className="hover:text-purple-900 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(filterParams.startDate || filterParams.endDate) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                Date: {filterParams.startDate || 'Start'} &rarr; {filterParams.endDate || 'End'}
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="hover:text-emerald-900 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-0.5 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching inventory movements..." />
        ) : movements.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={hasActiveFilters ? 'No matching inventory movements' : 'No movements recorded yet'}
              description={
                hasActiveFilters
                  ? 'No stock movements match the dynamic search criteria or filters applied.'
                  : 'Start recording Stock IN (receive) or Stock OUT (dispatch) transactions.'
              }
              actionText={hasActiveFilters ? 'Clear All Filters' : 'Record Movement'}
              onAction={() => {
                if (hasActiveFilters) {
                  handleClearFilters();
                } else {
                  setIsModalOpen(true);
                }
              }}
              icon={<ArrowLeftRight className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Quantity (Unit)</th>
                  <th className="px-6 py-3.5">Base Equivalent</th>
                  <th className="px-6 py-3.5">Unit Price</th>
                  <th className="px-6 py-3.5">Total Value</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((movement) => {
                  const isCustomUnit =
                    movement.unitId &&
                    movement.baseUnitId &&
                    movement.unitId !== movement.baseUnitId;

                  return (
                    <tr
                      key={movement.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                        #{movement.id}
                      </td>
                      <td className="px-6 py-4">
                        <MovementTypeBadge type={movement.movementType} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate max-w-[200px]" title={movement.productName}>
                              {movement.productName}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {movement.categoryName || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {movement.quantity}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            {movement.unitSymbol || movement.unitName || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium text-slate-700 text-xs">
                            {movement.baseQuantity} {movement.baseUnitSymbol || ''}
                          </span>
                          {isCustomUnit && (
                            <span
                              className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono"
                              title={`Conversion factor: 1 ${movement.unitSymbol} = ${movement.conversionFactor} ${movement.baseUnitSymbol}`}
                            >
                              <Scale className="h-2.5 w-2.5" />
                              {movement.conversionFactor}x
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        ${Number(movement.unitPrice).toFixed(2)}
                        <span className="text-[10px] text-slate-400 font-sans ml-0.5">
                          /{movement.unitSymbol || 'unit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                        ${Number(movement.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(movement.movementDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeletingMovement(movement)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Movement Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination */}
        {pagedMovements && pagedMovements.totalElements > 0 && (
          <Pagination
            currentPage={pagedMovements.page}
            totalPages={pagedMovements.totalPages}
            totalElements={pagedMovements.totalElements}
            pageSize={filterParams.size || 10}
            onPageChange={(newPage) =>
              onFilterChange({ ...filterParams, page: newPage })
            }
            onPageSizeChange={(newSize) =>
              onFilterChange({ ...filterParams, size: newSize, page: 0 })
            }
          />
        )}
      </div>

      {/* Record Movement Modal */}
      <CreateMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        products={products}
        units={units}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingMovement}
        onClose={() => setDeletingMovement(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Movement Record?"
        message={`Are you sure you want to remove movement #${deletingMovement?.id} (${deletingMovement?.movementType} ${deletingMovement?.quantity} ${deletingMovement?.unitSymbol}) from history?`}
        confirmText="Delete Record"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
