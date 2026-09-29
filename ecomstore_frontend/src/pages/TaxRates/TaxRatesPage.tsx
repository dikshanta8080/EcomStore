import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Percent, Receipt, ShieldCheck } from 'lucide-react';
import type { TaxRate, TaxRateRequest } from '../../types/taxRate';
import { TaxRateFormModal } from './TaxRateFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface TaxRatesPageProps {
  taxRates: TaxRate[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreateTaxRate: (data: TaxRateRequest) => Promise<void>;
  onUpdateTaxRate: (id: number, data: TaxRateRequest) => Promise<void>;
  onDeleteTaxRate: (id: number) => Promise<void>;
}

export const TaxRatesPage: React.FC<TaxRatesPageProps> = ({
  taxRates,
  isLoading,
  onCreateTaxRate,
  onUpdateTaxRate,
  onDeleteTaxRate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [deletingTaxRate, setDeletingTaxRate] = useState<TaxRate | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredRates = taxRates.filter((tr) =>
    String(tr.rate).includes(searchTerm) || String(tr.id).includes(searchTerm)
  );

  const handleCreateOrUpdate = async (data: TaxRateRequest) => {
    setActionLoading(true);
    try {
      if (editingTaxRate) {
        await onUpdateTaxRate(editingTaxRate.id, data);
      } else {
        await onCreateTaxRate(data);
      }
      setIsFormOpen(false);
      setEditingTaxRate(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTaxRate) return;
    setActionLoading(true);
    try {
      await onDeleteTaxRate(deletingTaxRate.id);
      setDeletingTaxRate(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tax Rates Configured
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {taxRates.length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Standard Rates
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-700">
            {taxRates.length > 0
              ? taxRates.map((r) => `${r.rate}%`).slice(0, 4).join(', ') + (taxRates.length > 4 ? '...' : '')
              : 'None'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Compliance Status
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-sm font-semibold text-emerald-600 flex items-center gap-1">
            Active & Enforced
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by percentage or ID..."
            className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        <button
          onClick={() => {
            setEditingTaxRate(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Tax Rate
        </button>
      </div>

      {/* Content Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching tax rates..." />
        ) : filteredRates.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm ? 'No matching tax rates' : 'No tax rates configured'}
              description={
                searchTerm
                  ? `No tax rates match "${searchTerm}". Try another rate value.`
                  : 'Add tax rate values (e.g. 0%, 5%, 13%) to assign to catalog products.'
              }
              actionText={searchTerm ? undefined : 'Add Tax Rate'}
              onAction={() => {
                setEditingTaxRate(null);
                setIsFormOpen(true);
              }}
              icon={<Percent className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Rate Percentage</th>
                  <th className="px-6 py-3.5">Example Impact ($100 Item)</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRates.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      #{tr.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 font-mono ring-1 ring-indigo-500/20">
                        <Percent className="h-3 w-3 text-indigo-500" />
                        {Number(tr.rate).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      Total: <span className="font-semibold text-slate-900">${(100 + (100 * Number(tr.rate)) / 100).toFixed(2)}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">(+${((100 * Number(tr.rate)) / 100).toFixed(2)} tax)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTaxRate(tr);
                            setIsFormOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Modify tax rate"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTaxRate(tr)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete tax rate"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <TaxRateFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTaxRate(null);
        }}
        onSubmit={handleCreateOrUpdate}
        taxRate={editingTaxRate}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTaxRate)}
        onClose={() => setDeletingTaxRate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tax Rate"
        message={
          deletingTaxRate
            ? `Are you sure you want to delete tax rate "${deletingTaxRate.rate}%" (ID #${deletingTaxRate.id})? This cannot be undone and will fail if products are linked to it.`
            : ''
        }
        confirmText="Delete Tax Rate"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
