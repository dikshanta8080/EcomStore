import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import type { Product } from '../../types/product';
import type { Unit, ProductUnitConversion, ProductUnitConversionRequest } from '../../types/unit';
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

  // New conversion form state
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

  // Units available to add (not the base unit, and not already configured)
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
      setSuccess('Conversion removed successfully');
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
      title={`Unit Conversions: ${product.name}`}
      subtitle={`Configure packaging & transaction units for SKU: ${product.sku}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Base Unit Card Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Product Base Unit (Inventory Standard)
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {baseUnitName} ({baseUnitSymbol})
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
            Standard: 1 {baseUnitSymbol} = 1.0 {baseUnitSymbol}
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Existing Conversions List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Configured Unit Conversions
          </h4>

          {isLoading ? (
            <div className="py-6 text-center text-sm text-slate-400">Loading conversions...</div>
          ) : conversions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              No additional unit conversions configured for this product yet.
              Transactions will only be allowed in the base unit ({baseUnitSymbol}).
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
              {conversions.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(conv)}
                      title={conv.active ? 'Active (click to deactivate)' : 'Inactive (click to activate)'}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {conv.active ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>1 {conv.unitSymbol}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-indigo-600">
                          {conv.conversionFactor} {baseUnitSymbol}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {conv.unitName} ({conv.unitType}) &middot;{' '}
                        {conv.active ? (
                          <span className="text-emerald-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-slate-400">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteConversion(conv.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Conversion"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Conversion Form */}
        <form
          onSubmit={handleAddConversion}
          className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-4"
        >
          <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-indigo-600" />
            Add New Unit Conversion for {product.name}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Transaction Unit <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newUnitId}
                onChange={(e) => setNewUnitId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              >
                <option value="" disabled>Select unit (e.g. BORA, PACKET)</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol}) — {u.unitType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                How many {baseUnitSymbol} per unit? <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                required
                value={newFactor}
                onChange={(e) => setNewFactor(e.target.value)}
                placeholder="e.g. 50 (for 1 BORA = 50 KG)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>

          {selectedUnit && (
            <div className="rounded-lg bg-white border border-indigo-100 p-2.5 text-xs text-indigo-900 font-medium">
              Conversion rule: <span className="font-bold">1 {selectedUnit.symbol}</span> will equal{' '}
              <span className="font-bold text-indigo-600">
                {newFactor || 1} {baseUnitSymbol}
              </span>{' '}
              in stock inventory.
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newUnitId}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Save Conversion'}
            </button>
          </div>
        </form>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
