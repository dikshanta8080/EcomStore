import React from 'react';
import { Modal } from '../../components/common/Modal';
import { StockBadge } from '../../components/common/Badge';
import type { Product } from '../../types/product';
import { Tag, Hash, ArrowLeftRight, Scale, ArrowRight, Percent, Package } from 'lucide-react';

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
      title="Product Specifications"
      subtitle={`SKU: ${product.sku}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Header Summary */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {product.categoryName || 'General Category'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{product.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Base Price</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                Rs. {Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Hash className="h-3.5 w-3.5" />
              <span>Product ID</span>
            </div>
            <p className="mt-1 font-mono font-semibold text-slate-900">#{product.id}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Tag className="h-3.5 w-3.5" />
              <span>SKU</span>
            </div>
            <p className="mt-1 font-mono font-semibold text-slate-900">{product.sku}</p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Scale className="h-3.5 w-3.5 text-slate-500" />
              <span>Base Unit</span>
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {product.baseUnitName || 'Standard'} ({product.baseUnitSymbol || 'Unit'})
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Percent className="h-3.5 w-3.5 text-slate-500" />
              <span>Tax Rate</span>
            </div>
            <p className="mt-1 font-medium text-slate-900">
              {product.taxRate !== undefined && product.taxRate !== null
                ? `${product.taxRate}% VAT`
                : 'Exempt (0%)'}
            </p>
          </div>

          <div className="col-span-2 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Package className="h-3.5 w-3.5" />
                <span>On-Hand Inventory</span>
              </div>
              <StockBadge stock={product.stock} />
            </div>
            <p className="mt-1.5 font-mono font-bold text-slate-900 text-sm">
              {product.stock} {product.baseUnitSymbol || 'Units'}
            </p>
          </div>
        </div>

        {/* Conversions */}
        {product.conversions && product.conversions.length > 0 && (
          <div className="text-xs">
            <h4 className="font-medium text-slate-700 mb-1.5">Packaging Conversions</h4>
            <div className="flex flex-wrap gap-1.5">
              {product.conversions.map((c) => (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-700"
                >
                  <span className="font-semibold">1 {c.unitSymbol}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="font-mono font-bold text-indigo-700">
                    {c.conversionFactor} {product.baseUnitSymbol}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="text-xs">
            <h4 className="font-medium text-slate-700 mb-1">Description</h4>
            <p className="text-slate-600 rounded-md border border-slate-200 bg-slate-50 p-2.5">
              {product.description}
            </p>
          </div>
        )}

        {/* Action footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
          <div className="flex items-center gap-2">
            {onRecordMovement && (
              <button
                onClick={() => {
                  onClose();
                  onRecordMovement(product);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-slate-500" />
                Record Movement
              </button>
            )}
            {onManageConversions && (
              <button
                onClick={() => {
                  onClose();
                  onManageConversions(product);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Scale className="h-3.5 w-3.5 text-slate-500" />
                Conversions
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
