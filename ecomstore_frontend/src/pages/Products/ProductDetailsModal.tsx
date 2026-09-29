import React from 'react';
import { Modal } from '../../components/common/Modal';
import { StockBadge } from '../../components/common/Badge';
import type { Product } from '../../types/product';
import { Tag, Hash, DollarSign, ArrowLeftRight, Scale, ArrowRight } from 'lucide-react';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onRecordMovement?: (product: Product) => void;
  onManageConversions?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  onRecordMovement,
  onManageConversions,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      subtitle={`SKU: ${product.sku}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Header Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 ring-1 ring-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {product.categoryName || 'General'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{product.name}</h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Unit Price (per {product.baseUnitSymbol || 'unit'})</span>
              <span className="text-2xl font-black text-slate-900">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <Hash className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product ID</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">#{product.id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <Tag className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{product.sku}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <Scale className="h-5 w-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Unit</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {product.baseUnitName || 'Standard'} ({product.baseUnitSymbol || 'Unit'})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Stock ({product.baseUnitSymbol || 'Units'})
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {product.stock} {product.baseUnitSymbol}
                </span>
                <StockBadge stock={product.stock} />
              </div>
            </div>
          </div>
        </div>

        {/* Configured Conversions */}
        {product.conversions && product.conversions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Configured Packaging & Conversions
            </h4>
            <div className="flex flex-wrap gap-2">
              {product.conversions.map((c) => (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
                >
                  <span className="font-bold">1 {c.unitSymbol}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="text-indigo-600 font-bold">
                    {c.conversionFactor} {product.baseUnitSymbol}
                  </span>
                  {!c.active && <span className="text-[10px] text-slate-400">(inactive)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</h4>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-600 leading-relaxed">
            {product.description || <span className="italic text-slate-400">No description provided for this product.</span>}
          </div>
        </div>

        {/* Action footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2">
            {onRecordMovement && (
              <button
                onClick={() => {
                  onClose();
                  onRecordMovement(product);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-400" />
                Adjust Stock Movement
              </button>
            )}

            {onManageConversions && (
              <button
                onClick={() => {
                  onClose();
                  onManageConversions(product);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Scale className="h-3.5 w-3.5" />
                Unit Conversions
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
