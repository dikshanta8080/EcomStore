import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Percent, X } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Tax Rates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure VAT, GST, and fiscal tax percentages applied to checkout items
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTaxRate(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Tax Rate
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
            placeholder="Search by rate % or ID..."
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

      {/* Content Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching tax rates..." />
        ) : filteredRates.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm ? 'No matching tax rates' : 'No tax rates configured'}
              description={
                searchTerm
                  ? `No tax rates match "${searchTerm}".`
                  : 'Add tax percentages (e.g., 0%, 5%, 13% VAT) to apply them to catalog items.'
              }
              actionText={searchTerm ? undefined : 'Add Tax Rate'}
              onAction={() => {
                setEditingTaxRate(null);
                setIsFormOpen(true);
              }}
              icon={<Percent className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Tax Percentage</th>
                  <th className="py-3 px-4">Enforcement</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRates.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{tr.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {Number(tr.rate).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Active Rate
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTaxRate(tr);
                            setIsFormOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Tax Rate"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTaxRate(tr)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Tax Rate"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Tax Rate Form Modal */}
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
        title={`Delete tax rate "${deletingTaxRate?.rate}%"?`}
        message={`Are you sure you want to delete "${deletingTaxRate?.rate}%"? Products currently assigned to this rate will prevent deletion.`}
        confirmText="Delete Tax Rate"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
