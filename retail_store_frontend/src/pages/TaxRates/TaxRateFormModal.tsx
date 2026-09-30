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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Tax Percentage (%) <span className="text-rose-500">*</span>
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
            placeholder="e.g. 13 or 18"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 pr-8 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Percent className="h-3.5 w-3.5" />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Enter 13 for 13% VAT, or 0 for exempt items.
        </p>
      </div>

      {/* Quick Rate Presets */}
      <div>
        <span className="block text-[11px] text-slate-500 mb-1.5 font-medium">
          Common Presets:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_RATES.map((preset) => (
            <button
              type="button"
              key={preset}
              onClick={() => setRateStr(String(preset))}
              className={`rounded border px-2 py-0.5 text-xs font-mono transition-colors ${
                rateStr === String(preset)
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Calculation Preview */}
      {rateStr && !isNaN(parseFloat(rateStr)) && (
        <div className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200/80 flex items-center justify-between">
          <span className="text-slate-500">Calculated on Rs. 100.00 base:</span>
          <span className="font-mono font-semibold text-slate-900">
            + Rs. {(100 * (parseFloat(rateStr) / 100)).toFixed(2)} tax (Rs. {(100 + 100 * (parseFloat(rateStr) / 100)).toFixed(2)} total)
          </span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5 mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading && (
            <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
      title={taxRate ? 'Edit Tax Rate' : 'New Tax Rate'}
      subtitle={taxRate ? `Updating tax rate #${taxRate.id}` : 'Configure tax percentage for products catalog'}
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
