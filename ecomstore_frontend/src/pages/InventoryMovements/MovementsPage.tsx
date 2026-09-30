import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, Trash2, Calendar, Search, X } from 'lucide-react';
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
  const [showDateFilters, setShowDateFilters] = useState(false);

  useEffect(() => {
    setSearchTerm(filterParams.search || '');
  }, [filterParams.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((filterParams.search || '') !== searchTerm.trim()) {
        onFilterChange({
          ...filterParams,
          search: searchTerm.trim() || undefined,
          page: 0,
        });
      }
    }, 300);

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
    filterParams.startDate ||
    filterParams.endDate
  );

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
    <div className="space-y-4">
      {/* Header and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Stock Movements</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of incoming inventory restocks and outgoing order dispatches
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Record Movement
        </button>
      </div>

      {/* Movement Type Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => handleTypeChange('ALL')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            !filterParams.movementType
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All Movements
        </button>
        <button
          onClick={() => handleTypeChange('IN')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            filterParams.movementType === 'IN'
              ? 'border-emerald-600 text-emerald-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock IN (Receive)
        </button>
        <button
          onClick={() => handleTypeChange('OUT')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
            filterParams.movementType === 'OUT'
              ? 'border-rose-600 text-rose-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock OUT (Dispatch)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-1 items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product name, SKU..."
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

            {/* Product Filter */}
            <div className="min-w-[150px]">
              <select
                value={filterParams.productId || ''}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Toggle */}
            <button
              type="button"
              onClick={() => setShowDateFilters(!showDateFilters)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showDateFilters || filterParams.startDate || filterParams.endDate
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>Dates</span>
              {(filterParams.startDate || filterParams.endDate) && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Reset filters"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Date Filters Drawer */}
        {showDateFilters && (
          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">From:</span>
              <input
                type="date"
                value={filterParams.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">To:</span>
              <input
                type="date"
                value={filterParams.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {(filterParams.startDate || filterParams.endDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="text-xs text-rose-600 hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching movements..." />
        ) : movements.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={hasActiveFilters ? 'No matching movements' : 'No movements recorded yet'}
              description={
                hasActiveFilters
                  ? 'No records match the selected filter criteria.'
                  : 'Record stock intake or dispatch transactions to audit inventory changes.'
              }
              actionText={hasActiveFilters ? 'Reset Filters' : 'Record Movement'}
              onAction={() => {
                if (hasActiveFilters) {
                  handleClearFilters();
                } else {
                  setIsModalOpen(true);
                }
              }}
              icon={<ArrowLeftRight className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{movement.id}
                    </td>
                    <td className="py-3 px-4">
                      <MovementTypeBadge type={movement.movementType} />
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <span className="font-semibold text-slate-900 block truncate" title={movement.productName}>
                        {movement.productName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {movement.categoryName || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {movement.quantity} {movement.unitSymbol || movement.unitName || ''}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      Rs. {Number(movement.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      Rs. {Number(movement.totalAmount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(movement.movementDate)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDeletingMovement(movement)}
                        className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Movement Record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
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
