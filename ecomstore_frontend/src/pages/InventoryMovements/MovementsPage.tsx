import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Trash2, Calendar, Package, Scale } from 'lucide-react';
import type { InventoryMovement, InventoryMovementRequest, MovementType } from '../../types/inventory';
import type { Product } from '../../types/product';
import type { Unit } from '../../types/unit';
import type { PagedResponse, PaginationParams } from '../../types/api';
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
  paginationParams: PaginationParams;
  onPaginationChange: (params: PaginationParams) => void;
  onCreateMovement: (data: InventoryMovementRequest) => Promise<void>;
  onDeleteMovement: (id: number) => Promise<void>;
}

export const MovementsPage: React.FC<MovementsPageProps> = ({
  pagedMovements,
  products,
  units,
  isLoading,
  paginationParams,
  onPaginationChange,
  onCreateMovement,
  onDeleteMovement,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | MovementType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMovement, setDeletingMovement] = useState<InventoryMovement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const rawMovements = pagedMovements?.content || [];
  const displayMovements = rawMovements.filter((m) => {
    if (filterType === 'ALL') return true;
    return m.movementType === filterType;
  });

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
      {/* Header filter & create button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Movement Type Filter Tabs */}
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilterType('ALL')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setFilterType('IN')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterType === 'IN'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'hover:text-emerald-700'
            }`}
          >
            Stock IN (Receive)
          </button>
          <button
            onClick={() => setFilterType('OUT')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              filterType === 'OUT'
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Record Movement
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching inventory movements..." />
        ) : displayMovements.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={filterType !== 'ALL' ? `No ${filterType} movements found` : 'No movements recorded yet'}
              description={
                filterType !== 'ALL'
                  ? `There are no stock ${filterType} movements in this list.`
                  : 'Start recording Stock IN (receive) or Stock OUT (dispatch) transactions.'
              }
              actionText="Record Movement"
              onAction={() => setIsModalOpen(true)}
              icon={<ArrowLeftRight className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Transaction Qty</th>
                  <th className="px-5 py-3.5">Base Stock Impact</th>
                  <th className="px-5 py-3.5">Unit Price</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayMovements.map((m) => {
                  const txUnit = m.unitSymbol || 'unit';
                  const baseUnit = m.baseUnitSymbol || 'unit';
                  const factor = m.conversionFactor ?? 1;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-400">
                        #{m.id}
                      </td>
                      <td className="px-5 py-4">
                        <MovementTypeBadge type={m.movementType} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{m.productName}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {m.categoryName || 'General'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-sm">
                          {m.movementType === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}{' '}
                          <span className="font-normal text-xs text-slate-500">{txUnit}</span>
                        </div>
                        {factor !== 1 && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Scale className="h-2.5 w-2.5" />
                            <span>1 {txUnit} = {factor} {baseUnit}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 font-mono text-xs font-bold text-indigo-700">
                          {m.movementType === 'IN' ? `+${m.baseQuantity}` : `-${m.baseQuantity}`} {baseUnit}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-700 font-mono">
                        ${Number(m.unitPrice).toFixed(2)}
                        <span className="text-[10px] text-slate-400 block font-normal font-sans">
                          per {txUnit}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 font-mono">
                        ${Number(m.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(m.movementDate)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setDeletingMovement(m)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
        {pagedMovements && pagedMovements.totalPages > 1 && (
          <Pagination
            currentPage={pagedMovements.page}
            totalPages={pagedMovements.totalPages}
            totalElements={pagedMovements.totalElements}
            pageSize={paginationParams.size || 10}
            onPageChange={(newPage) =>
              onPaginationChange({ ...paginationParams, page: newPage })
            }
            onPageSizeChange={(newSize) =>
              onPaginationChange({ ...paginationParams, size: newSize, page: 0 })
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
