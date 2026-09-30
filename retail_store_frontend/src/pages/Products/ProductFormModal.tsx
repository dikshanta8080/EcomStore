import React, { useState, useRef, useEffect } from 'react';
import { Search, Percent, ChevronDown, Check, X } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../../types/product';
import type { Category } from '../../types/category';
import type { Unit } from '../../types/unit';
import type { TaxRate } from '../../types/taxRate';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  units: Unit[];
  taxRates?: TaxRate[];
  isLoading?: boolean;
}

const ProductFormContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  units: Unit[];
  taxRates?: TaxRate[];
  isLoading?: boolean;
}> = ({ onClose, onSubmit, product, categories, units, taxRates = [], isLoading = false }) => {
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
  const [taxRateId, setTaxRateId] = useState<number | ''>(
    product?.taxRateId ? product.taxRateId : ''
  );
  const [isTaxDropdownOpen, setIsTaxDropdownOpen] = useState(false);
  const [taxSearchQuery, setTaxSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const taxDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (taxDropdownRef.current && !taxDropdownRef.current.contains(e.target as Node)) {
        setIsTaxDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const parsedPrice = parseFloat(price);

  const filteredTaxRates = taxRates.filter((tr) =>
    String(tr.rate).toLowerCase().includes(taxSearchQuery.toLowerCase()) ||
    String(tr.id).includes(taxSearchQuery)
  );

  const selectedTaxRate = taxRates.find((tr) => tr.id === Number(taxRateId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required');
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
        const updateData: ProductUpdateRequest = {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          price: numPrice,
          categoryId: Number(categoryId),
          baseUnitId: Number(baseUnitId),
          taxRateId: taxRateId !== '' ? Number(taxRateId) : 0,
        };
        await onSubmit(updateData);
      } else {
        const createData: ProductCreateRequest = {
          name: name.trim(),
          sku: sku.trim(),
          description: description.trim(),
          price: numPrice,
          categoryId: Number(categoryId),
          baseUnitId: Number(baseUnitId),
          taxRateId: taxRateId !== '' ? Number(taxRateId) : undefined,
        };
        await onSubmit(createData);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Basmati Rice, Sunflower Oil"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            SKU Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={50}
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="e.g. RICE-BASMATI-001"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Price Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Unit Price (Rs.) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
        </div>

        {/* Searchable Tax Rate Dropdown */}
        <div className="relative" ref={taxDropdownRef}>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span>Tax Rate</span>
            <span className="text-[11px] text-slate-400">(optional)</span>
          </label>

          <button
            type="button"
            onClick={() => setIsTaxDropdownOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between rounded-md border bg-white px-3 py-1.5 text-xs text-left transition-colors ${
              isTaxDropdownOpen
                ? 'border-indigo-600'
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Percent className={`h-3.5 w-3.5 shrink-0 ${selectedTaxRate ? 'text-indigo-600' : 'text-slate-400'}`} />
              {selectedTaxRate ? (
                <span className="font-medium text-slate-900 truncate">
                  {selectedTaxRate.rate}% Tax Rate
                </span>
              ) : (
                <span className="text-slate-400">Select Tax Rate...</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              {selectedTaxRate && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaxRateId('');
                  }}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Clear"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                  isTaxDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Popover */}
          {isTaxDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-md border border-slate-200 bg-white p-2 shadow-lg">
              <div className="relative mb-1.5">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={taxSearchQuery}
                  onChange={(e) => setTaxSearchQuery(e.target.value)}
                  placeholder="Search percentage..."
                  className="w-full rounded border border-slate-200 bg-slate-50 pl-7 pr-2 py-1 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setTaxRateId('');
                    setIsTaxDropdownOpen(false);
                    setTaxSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                    taxRateId === ''
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>None (Tax Exempt / 0%)</span>
                  {taxRateId === '' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                </button>

                {filteredTaxRates.length === 0 ? (
                  <div className="p-2 text-center text-xs text-slate-400">
                    No tax rates match
                  </div>
                ) : (
                  filteredTaxRates.map((tr) => {
                    const isSelected = Number(taxRateId) === tr.id;
                    const calculatedTax =
                      !isNaN(parsedPrice) && parsedPrice > 0
                        ? (parsedPrice * Number(tr.rate)) / 100
                        : 0;
                    return (
                      <button
                        type="button"
                        key={tr.id}
                        onClick={() => {
                          setTaxRateId(tr.id);
                          setIsTaxDropdownOpen(false);
                          setTaxSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium">{tr.rate}%</span>
                          {!isNaN(parsedPrice) && parsedPrice > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              (+Rs. {calculatedTax.toFixed(2)})
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tax Breakdown Preview */}
      {selectedTaxRate && !isNaN(parsedPrice) && parsedPrice > 0 && (
        <div className="rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200/80 flex items-center justify-between">
          <span>
            Tax ({selectedTaxRate.rate}%):{' '}
            <strong className="font-mono font-semibold text-slate-900">
              +Rs. {((parsedPrice * Number(selectedTaxRate.rate)) / 100).toFixed(2)}
            </strong>
          </span>
          <span>
            Total Price:{' '}
            <strong className="font-mono font-bold text-slate-900">
              Rs. {(parsedPrice + (parsedPrice * Number(selectedTaxRate.rate)) / 100).toFixed(2)}
            </strong>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Base Unit <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={baseUnitId}
            onChange={(e) => setBaseUnitId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="" disabled>
              Select base unit
            </option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.symbol} — {u.name} ({u.unitType})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product specifications, notes, packaging details..."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5 mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-md border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
  taxRates = [],
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'New Product'}
      subtitle={
        product
          ? `Updating product #${product.id} (${product.sku})`
          : 'Add a new product to catalog'
      }
      maxWidth="lg"
    >
      <ProductFormContent
        key={product ? `edit-${product.id}-${product.taxRateId}` : 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        product={product}
        categories={categories}
        units={units}
        taxRates={taxRates}
        isLoading={isLoading}
      />
    </Modal>
  );
};
