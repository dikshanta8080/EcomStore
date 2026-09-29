import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../../types/product';
import type { Category } from '../../types/category';
import type { Unit } from '../../types/unit';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  units: Unit[];
  isLoading?: boolean;
}

const ProductFormContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  units: Unit[];
  isLoading?: boolean;
}> = ({ onClose, onSubmit, product, categories, units, isLoading = false }) => {
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product ? product.price.toString() : '');
  const [categoryId, setCategoryId] = useState<number | ''>(
    product ? product.categoryId : categories.length > 0 ? categories[0].id : ''
  );
  const [baseUnitId, setBaseUnitId] = useState<number | ''>(
    product?.baseUnitId ? product.baseUnitId : units.length > 0 ? units[0].id : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Product name is required (max 150 characters)');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required (max 50 characters)');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!baseUnitId) {
      setError('Please select a base unit');
      return;
    }

    try {
      setError(null);
      if (product) {
        // Update request
        const updateData: ProductUpdateRequest = {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          price: numPrice,
          categoryId: Number(categoryId),
          baseUnitId: Number(baseUnitId),
        };
        await onSubmit(updateData);
      } else {
        // Create request
        const createData: ProductCreateRequest = {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          price: numPrice,
          categoryId: Number(categoryId),
          baseUnitId: Number(baseUnitId),
        };
        await onSubmit(createData);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Basmati Rice, Sunflower Oil"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            SKU <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="e.g. RICE-BASMATI-001"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Price ($) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          >
            <option value="" disabled>Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Base Unit <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={baseUnitId}
            onChange={(e) => setBaseUnitId(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          >
            <option value="" disabled>Select base unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.symbol} — {u.name} ({u.unitType})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the product..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
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
          {product ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
  units,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Create New Product'}
      subtitle={product ? `Updating product #${product.id} (${product.sku})` : 'Enter product details to add to catalog'}
      maxWidth="lg"
    >
      <ProductFormContent
        key={product ? `edit-${product.id}` : 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        product={product}
        categories={categories}
        units={units}
        isLoading={isLoading}
      />
    </Modal>
  );
};
