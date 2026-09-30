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
  { value: 'WEIGHT', label: 'Weight', desc: 'e.g. KG, Gram, Ton' },
  { value: 'VOLUME', label: 'Volume', desc: 'e.g. Liter, ML' },
  { value: 'COUNT', label: 'Count / Pack', desc: 'e.g. Piece, Packet, Box' },
  { value: 'OTHER', label: 'Custom', desc: 'e.g. Bora, Sack, Bundle' },
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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Unit Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kilogram, Piece, Sack"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Symbol / Code <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="e.g. KG, PC, BORA, L"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Unit Dimension / Type <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {UNIT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setUnitType(t.value)}
              className={`p-2.5 rounded-md border text-left transition-colors ${
                unitType === t.value
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-xs font-semibold">{t.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

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
      title={unit ? 'Edit Unit' : 'New Unit'}
      subtitle={unit ? `Updating unit ${unit.symbol}` : 'Add a measurement or packaging unit'}
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
