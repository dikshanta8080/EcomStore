import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import type { Unit, UnitRequest, UnitType } from '../../types/unit';

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitRequest) => Promise<void>;
  unit?: Unit | null;
  isLoading?: boolean;
}

const UNIT_TYPES: { value: UnitType; label: string; desc: string }[] = [
  { value: 'WEIGHT', label: 'Weight', desc: 'e.g. KG, GRAM, TON' },
  { value: 'VOLUME', label: 'Volume', desc: 'e.g. LITER, ML' },
  { value: 'COUNT', label: 'Count / Packaging', desc: 'e.g. PIECE, PACKET, BOX, CARTON' },
  { value: 'OTHER', label: 'Custom / Other', desc: 'e.g. BORA, SACK, BAG' },
];

const UnitFormContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: UnitRequest) => Promise<void>;
  unit?: Unit | null;
  isLoading?: boolean;
}> = ({ onClose, onSubmit, unit, isLoading = false }) => {
  const [name, setName] = useState(unit?.name || '');
  const [symbol, setSymbol] = useState(unit?.symbol || '');
  const [unitType, setUnitType] = useState<UnitType>(unit?.unitType || 'COUNT');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Unit name is required');
      return;
    }
    if (!symbol.trim()) {
      setError('Unit symbol is required');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        unitType,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save unit');
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
          Unit Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kilogram, Bora / Sack, Bottle"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Symbol / Code <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g. KG, BORA, L, PC, CTN"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-mono uppercase shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Unit Dimension / Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {UNIT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setUnitType(t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                unitType === t.value
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold text-slate-900">{t.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

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
          {unit ? 'Save Changes' : 'Create Unit'}
        </button>
      </div>
    </form>
  );
};

export const UnitFormModal: React.FC<UnitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  unit,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? 'Edit Unit' : 'Create New Unit'}
      subtitle={unit ? `Updating unit ${unit.symbol}` : 'Add a standard or custom unit for inventory transactions'}
      maxWidth="md"
    >
      <UnitFormContent
        key={unit ? `edit-${unit.id}` : 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        unit={unit}
        isLoading={isLoading}
      />
    </Modal>
  );
};
