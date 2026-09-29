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

  // Close dropdown on outside click
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
          taxRateId: taxRateId !== '' ? Number(taxRateId) : 0,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price Input */}
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
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono"
          />
        </div>

        {/* Searchable Tax Rate Dropdown */}
        <div className="relative" ref={taxDropdownRef}>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Tax Rate</span>
            <span className="text-[11px] font-normal text-slate-400 lowercase">(optional)</span>
          </label>

          <button
            type="button"
            onClick={() => setIsTaxDropdownOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-2xs transition-all text-left ${
              isTaxDropdownOpen
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Percent className={`h-4 w-4 shrink-0 ${selectedTaxRate ? 'text-indigo-600' : 'text-slate-400'}`} />
              {selectedTaxRate ? (
                <span className="font-semibold text-slate-900 truncate">
                  {selectedTaxRate.rate}% Tax Rate
                </span>
              ) : (
                <span className="text-slate-400">Select Tax Rate...</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {selectedTaxRate && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaxRateId('');
                  }}
                  className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  title="Clear tax rate"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isTaxDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Popover */}
          {isTaxDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              {/* Search bar inside dropdown */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={taxSearchQuery}
                  onChange={(e) => setTaxSearchQuery(e.target.value)}
                  placeholder="Search tax rate (e.g. 13, 5)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8.5 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Scrollable List */}
              <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                {/* Option: None / Tax Exempt */}
                <button
                  type="button"
                  onClick={() => {
                    setTaxRateId('');
                    setIsTaxDropdownOpen(false);
                    setTaxSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                    taxRateId === ''
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    None (Tax Exempt / 0%)
                  </span>
                  {taxRateId === '' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                </button>

                {filteredTaxRates.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No tax rates match "{taxSearchQuery}"
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
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100/70 px-1.5 py-0.5 text-[11px] font-mono font-bold text-indigo-700">
                            {tr.rate}%
                          </span>
                          {!isNaN(parsedPrice) && parsedPrice > 0 && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              (+${calculatedTax.toFixed(2)} tax)
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

      {/* Live Tax Breakdown Card */}
      {selectedTaxRate && !isNaN(parsedPrice) && parsedPrice > 0 && (
        <div className="rounded-xl bg-indigo-50/70 p-3.5 text-xs text-indigo-950 border border-indigo-100/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <Percent className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              Tax ({selectedTaxRate.rate}%):{' '}
              <strong className="font-mono text-indigo-700">
                +${((parsedPrice * Number(selectedTaxRate.rate)) / 100).toFixed(2)}
              </strong>
            </span>
          </div>
          <span className="font-semibold text-slate-700">
            Total Price:{' '}
            <strong className="font-mono text-indigo-700 font-bold text-sm">
              ${(parsedPrice + (parsedPrice * Number(selectedTaxRate.rate)) / 100).toFixed(2)}
            </strong>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Base Unit <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={baseUnitId}
            onChange={(e) => setBaseUnitId(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
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
  taxRates = [],
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Create New Product'}
      subtitle={
        product
          ? `Updating product #${product.id} (${product.sku})`
          : 'Enter product details to add to catalog'
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
