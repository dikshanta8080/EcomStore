import React, { useState } from 'react';
import { Percent } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { TaxRate, TaxRateRequest } from '../../types/taxRate';

interface TaxRateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxRateRequest) => Promise<void>;
  taxRate?: TaxRate | null;
  isLoading?: boolean;
}

const PRESET_RATES = [0, 5, 10, 12, 13, 18, 20];

const TaxRateFormContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: TaxRateRequest) => Promise<void>;
  taxRate?: TaxRate | null;
  isLoading?: boolean;
}> = ({ onClose, onSubmit, taxRate, isLoading = false }) => {
  const [rateStr, setRateStr] = useState<string>(
    taxRate !== undefined && taxRate !== null ? String(taxRate.rate) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRate = parseFloat(rateStr);
    if (isNaN(parsedRate)) {
      setError('Please enter a valid numeric tax rate.');
      return;
    }
    if (parsedRate < 0) {
      setError('Tax rate cannot be negative.');
      return;
    }
    if (parsedRate > 100) {
      setError('Tax rate cannot exceed 100%.');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        rate: parsedRate,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save tax rate');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Tax Rate Percentage (%) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
            placeholder="e.g. 13 or 18.5"
            className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Example: Enter <strong>13</strong> for 13% VAT/GST or <strong>0</strong> for tax-exempt items.
        </p>
      </div>

      {/* Quick Rate Presets */}
      <div>
        <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Common Rate Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_RATES.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setRateStr(String(preset))}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                rateStr === String(preset)
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Preview */}
      {rateStr && !isNaN(parseFloat(rateStr)) && (
        <div className="rounded-xl bg-indigo-50/70 p-3.5 text-xs text-indigo-900 border border-indigo-100 flex items-center justify-between">
          <span className="font-medium">Applied on $100.00 base product:</span>
          <span className="font-mono font-bold">
            + ${(100 * (parseFloat(rateStr) / 100)).toFixed(2)} tax (${(100 + 100 * (parseFloat(rateStr) / 100)).toFixed(2)} total)
          </span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading && (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {taxRate ? 'Update Rate' : 'Create Tax Rate'}
        </button>
      </div>
    </form>
  );
};

export const TaxRateFormModal: React.FC<TaxRateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taxRate,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taxRate ? 'Edit Tax Rate' : 'Create New Tax Rate'}
      subtitle={taxRate ? `Updating tax rate ID #${taxRate.id}` : 'Configure tax percentage for products catalog'}
      maxWidth="md"
    >
      <TaxRateFormContent
        key={taxRate ? `edit-${taxRate.id}-${taxRate.rate}` : 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        taxRate={taxRate}
        isLoading={isLoading}
      />
    </Modal>
  );
};
