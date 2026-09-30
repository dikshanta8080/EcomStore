import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import type { Product } from '../../types/product';
import type { Unit, ProductUnitConversion } from '../../types/unit';
import { productUnitConversionService } from '../../api/productUnitConversionService';
import { getErrorMessage } from '../../api/client';
import { Scale, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface ProductConversionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  units: Unit[];
  onConversionUpdated?: () => void;
}

export const ProductConversionsModal: React.FC<ProductConversionsModalProps> = ({
  isOpen,
  onClose,
  product,
  units,
  onConversionUpdated,
}) => {
  const [conversions, setConversions] = useState<ProductUnitConversion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newUnitId, setNewUnitId] = useState<number | ''>('');
  const [newFactor, setNewFactor] = useState<string>('1');

  const baseUnitSymbol = product?.baseUnitSymbol || 'Units';
  const baseUnitName = product?.baseUnitName || 'Base Unit';

  const loadConversions = async () => {
    if (!product) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await productUnitConversionService.getConversions(product.id);
      setConversions(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      loadConversions();
      setNewUnitId('');
      setNewFactor('1');
      setError(null);
      setSuccess(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  const existingUnitIds = new Set(conversions.map((c) => c.unitId));
  if (product?.baseUnitId) {
    existingUnitIds.add(product.baseUnitId);
  }
  const availableUnits = units.filter((u) => !existingUnitIds.has(u.id));
  const selectedUnit = units.find((u) => u.id === Number(newUnitId));

  const handleAddConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newUnitId) return;

    const factorNum = parseFloat(newFactor);
    if (isNaN(factorNum) || factorNum <= 0) {
      setError('Conversion factor must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await productUnitConversionService.addConversion(product.id, {
        unitId: Number(newUnitId),
        conversionFactor: factorNum,
        active: true,
      });
      setSuccess(`Added conversion for ${selectedUnit?.symbol || 'unit'}`);
      setNewUnitId('');
      setNewFactor('1');
      await loadConversions();
      onConversionUpdated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (conversion: ProductUnitConversion) => {
    if (!product) return;
    try {
      await productUnitConversionService.updateConversion(product.id, conversion.id, {
        unitId: conversion.unitId,
        conversionFactor: conversion.conversionFactor,
        active: !conversion.active,
      });
      await loadConversions();
      onConversionUpdated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteConversion = async (conversionId: number) => {
    if (!product) return;
    setError(null);
    setSuccess(null);
    try {
      await productUnitConversionService.deleteConversion(product.id, conversionId);
      setSuccess('Conversion removed');
      await loadConversions();
      onConversionUpdated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unit Conversions"
      subtitle={`${product.name} (SKU: ${product.sku})`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Base Unit Info */}
        <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-slate-500" />
            <div>
              <span className="text-slate-400 block text-[10px]">Standard Base Unit</span>
              <span className="font-semibold text-slate-900">{baseUnitName} ({baseUnitSymbol})</span>
            </div>
          </div>
          <span className="font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
            1 {baseUnitSymbol} = 1.0 {baseUnitSymbol}
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Existing Conversions List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2">
            Configured Conversions
          </h4>

          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading conversions...</div>
          ) : conversions.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
              No packaging unit conversions configured for this product.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white overflow-hidden text-xs">
              {conversions.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(conv)}
                      title={conv.active ? 'Active' : 'Inactive'}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {conv.active ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <span>1 {conv.unitSymbol}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span className="text-indigo-600 font-mono">
                          {conv.conversionFactor} {baseUnitSymbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {conv.unitName} ({conv.unitType}) &middot;{' '}
                        {conv.active ? (
                          <span className="text-emerald-700 font-medium">Active</span>
                        ) : (
                          <span className="text-slate-400">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteConversion(conv.id)}
                    className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Conversion"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Conversion Form */}
        <form
          onSubmit={handleAddConversion}
          className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2.5 text-xs"
        >
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <Plus className="h-3.5 w-3.5 text-indigo-600" />
            Add Conversion Rule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Transaction Unit <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newUnitId}
                onChange={(e) => setNewUnitId(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              >
                <option value="" disabled>Select unit</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol}) — {u.unitType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Base Units per packaging <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                value={newFactor}
                onChange={(e) => setNewFactor(e.target.value)}
                placeholder="e.g. 25"
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          {selectedUnit && (
            <div className="text-[11px] text-slate-500">
              Rule: 1 {selectedUnit.symbol} = <span className="font-mono font-bold text-slate-800">{newFactor || 1} {baseUnitSymbol}</span> in warehouse stock.
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !newUnitId}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Rule'}
            </button>
          </div>
        </form>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
