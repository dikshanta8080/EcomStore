import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  SlidersHorizontal,
  ArrowLeftRight,
  Scale,
  Package,
  X,
  RotateCcw,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import type { Product, ProductCreateRequest, ProductUpdateRequest, ProductQueryParams, ProductSummary } from '../../types/product';
import type { Category } from '../../types/category';
import type { Unit } from '../../types/unit';
import type { TaxRate } from '../../types/taxRate';
import type { PagedResponse } from '../../types/api';
import { StockBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ProductFormModal } from './ProductFormModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { ProductConversionsModal } from './ProductConversionsModal';

interface ProductsPageProps {
  pagedProducts: PagedResponse<Product> | null;
  categories: Category[];
  units: Unit[];
  taxRates?: TaxRate[];
  summary?: ProductSummary | null;
  isLoading: boolean;
  queryParams: ProductQueryParams;
  onQueryParamsChange: (params: ProductQueryParams) => void;
  onCreateProduct: (data: ProductCreateRequest) => Promise<void>;
  onUpdateProduct: (id: number, data: ProductUpdateRequest) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onRestoreProduct?: (id: number) => Promise<void>;
  onOpenMovementModalForProduct: (product: Product) => void;
  onRefreshProducts?: () => Promise<void>;
  onSeedData?: () => Promise<void>;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  pagedProducts,
  categories,
  units,
  taxRates = [],
  summary,
  isLoading,
  queryParams,
  onQueryParamsChange,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestoreProduct,
  onOpenMovementModalForProduct,
  onRefreshProducts,
  onSeedData,
}) => {
  // Local filter inputs for responsive typing and debouncing
  const [searchInput, setSearchInput] = useState(queryParams.nameOrCategoryName || '');
  const [skuInput, setSkuInput] = useState(queryParams.sku || '');
  const [minPriceInput, setMinPriceInput] = useState(
    queryParams.minPrice !== undefined ? String(queryParams.minPrice) : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    queryParams.maxPrice !== undefined ? String(queryParams.maxPrice) : ''
  );
  const [minStockInput, setMinStockInput] = useState(
    queryParams.minStock !== undefined ? String(queryParams.minStock) : ''
  );
  const [maxStockInput, setMaxStockInput] = useState(
    queryParams.maxStock !== undefined ? String(queryParams.maxStock) : ''
  );

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [managingConversionsProduct, setManagingConversionsProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync inputs if queryParams changes externally (e.g. from resets)
  useEffect(() => {
    setSearchInput(queryParams.nameOrCategoryName || '');
    setSkuInput(queryParams.sku || '');
    setMinPriceInput(queryParams.minPrice !== undefined ? String(queryParams.minPrice) : '');
    setMaxPriceInput(queryParams.maxPrice !== undefined ? String(queryParams.maxPrice) : '');
    setMinStockInput(queryParams.minStock !== undefined ? String(queryParams.minStock) : '');
    setMaxStockInput(queryParams.maxStock !== undefined ? String(queryParams.maxStock) : '');
  }, [
    queryParams.nameOrCategoryName,
    queryParams.sku,
    queryParams.minPrice,
    queryParams.maxPrice,
    queryParams.minStock,
    queryParams.maxStock,
  ]);

  // Debounced search for Name/Category and SKU
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      onQueryParamsChange({
        ...queryParams,
        nameOrCategoryName: val.trim() ? val.trim() : undefined,
        page: 0,
      });
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    onQueryParamsChange({
      ...queryParams,
      nameOrCategoryName: undefined,
      page: 0,
    });
  };

  const handleSkuChange = (val: string) => {
    setSkuInput(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      onQueryParamsChange({
        ...queryParams,
        sku: val.trim() ? val.trim() : undefined,
        page: 0,
      });
    }, 350);
  };

  // Immediate category change
  const handleCategoryChange = (catIdStr: string) => {
    const categoryId = catIdStr === 'all' ? undefined : Number(catIdStr);
    onQueryParamsChange({
      ...queryParams,
      categoryId,
      page: 0,
    });
  };

  // Apply price & stock filters
  const handleApplyRangeFilters = () => {
    const minP = minPriceInput.trim() ? parseFloat(minPriceInput) : undefined;
    const maxP = maxPriceInput.trim() ? parseFloat(maxPriceInput) : undefined;
    const minS = minStockInput.trim() ? parseInt(minStockInput, 10) : undefined;
    const maxS = maxStockInput.trim() ? parseInt(maxStockInput, 10) : undefined;

    onQueryParamsChange({
      ...queryParams,
      minPrice: !isNaN(minP as number) ? minP : undefined,
      maxPrice: !isNaN(maxP as number) ? maxP : undefined,
      minStock: !isNaN(minS as number) ? minS : undefined,
      maxStock: !isNaN(maxS as number) ? maxS : undefined,
      page: 0,
    });
  };

  // Stock quick presets
  const handleStockPreset = (preset: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK') => {
    let minS: number | undefined;
    let maxS: number | undefined;

    if (preset === 'IN_STOCK') {
      minS = 11;
      maxS = undefined;
    } else if (preset === 'LOW_STOCK') {
      minS = 1;
      maxS = 10;
    } else if (preset === 'OUT_OF_STOCK') {
      minS = 0;
      maxS = 0;
    }

    setMinStockInput(minS !== undefined ? String(minS) : '');
    setMaxStockInput(maxS !== undefined ? String(maxS) : '');

    onQueryParamsChange({
      ...queryParams,
      minStock: minS,
      maxStock: maxS,
      page: 0,
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSkuInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setMinStockInput('');
    setMaxStockInput('');
    onQueryParamsChange({
      page: 0,
      size: queryParams.size || 10,
      sort: 'id',
      direction: 'asc',
    });
  };

  // Dynamic sorting on table headers
  const handleSortChange = (sortBy: string) => {
    const isCurrentSort = queryParams.sort === sortBy;
    const newDirection = isCurrentSort && queryParams.direction === 'asc' ? 'desc' : 'asc';
    onQueryParamsChange({
      ...queryParams,
      sort: sortBy,
      direction: newDirection,
      page: 0,
    });
  };

  const renderSortIcon = (sortBy: string) => {
    if (queryParams.sort !== sortBy) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return queryParams.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-indigo-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-600" />
    );
  };

  // Active filter count calculation
  const activeFilterCount = [
    Boolean(queryParams.nameOrCategoryName),
    Boolean(queryParams.sku),
    queryParams.categoryId !== undefined,
    queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined,
    queryParams.minStock !== undefined || queryParams.maxStock !== undefined,
    queryParams.active !== undefined,
  ].filter(Boolean).length;

  const hasAnyFilter = activeFilterCount > 0;

  // Selected category object
  const selectedCategoryObj = categories.find((c) => c.id === queryParams.categoryId);

  // Products from server
  const products = pagedProducts?.content || [];

  const handleCreateOrUpdate = async (data: ProductCreateRequest | ProductUpdateRequest) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, data as ProductUpdateRequest);
      } else {
        await onCreateProduct(data as ProductCreateRequest);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      await onDeleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend-Driven Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        {/* Total Tracked Products */}
        <div
          onClick={() => handleStockPreset('ALL')}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Tracked Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {summary ? summary.totalProducts : pagedProducts?.totalElements ?? 0}
            </span>
            <span className="text-xs text-slate-400">
              {summary ? `${Number(summary.totalStockUnits).toLocaleString()} units` : 'across catalog'}
            </span>
          </div>
        </div>

        {/* Healthy In Stock */}
        <div
          onClick={() => handleStockPreset('IN_STOCK')}
          className={`rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all ${
            queryParams.minStock === 11 && queryParams.maxStock === undefined
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Healthy Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {summary?.healthyStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">&gt; 10 units</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => handleStockPreset('LOW_STOCK')}
          className={`rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all ${
            queryParams.minStock === 1 && queryParams.maxStock === 10
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
              : 'border-slate-200/80 bg-white hover:border-amber-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Alert
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono">
              {summary?.lowStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">needs restocking</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => handleStockPreset('OUT_OF_STOCK')}
          className={`rounded-2xl border p-5 shadow-2xs cursor-pointer transition-all ${
            queryParams.minStock === 0 && queryParams.maxStock === 0
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
              : 'border-slate-200/80 bg-white hover:border-rose-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Out of Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {summary?.outOfStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">zero stock</span>
          </div>
        </div>
      </div>

      {/* Top Bar: Search, Category, Filter Toggle, and Add Button */}
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 min-w-0">
          <div className="flex flex-1 flex-wrap items-stretch sm:items-center gap-2.5 min-w-0">
            {/* Search Input (Debounced) */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by product or category name..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[170px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select
                value={queryParams.categoryId !== undefined ? String(queryParams.categoryId) : 'all'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-2xs transition-all ${
                showAdvancedFilters || hasAnyFilter
                  ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Seed Sample Data Button */}
          {onSeedData && (
            <button
              onClick={onSeedData}
              title="Populate 52 realistic catalog products across all categories and tax rates to test pagination and filters"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.98] shrink-0"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Seed 50+ Products
            </button>
          )}

          {/* Add Product Button */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/30 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2.5">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
                Dynamic Specification Filters
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {/* SKU Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Filter by SKU
                </label>
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  placeholder="e.g. SKU-101, RICE"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Price Range ($)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Min $"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyRangeFilters()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Max $"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyRangeFilters()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock Range */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Stock Range
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minStockInput}
                    onChange={(e) => setMinStockInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyRangeFilters()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxStockInput}
                    onChange={(e) => setMaxStockInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyRangeFilters()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Catalog Status
                </label>
                <select
                  value={queryParams.active === undefined ? 'active' : queryParams.active ? 'active' : 'archived'}
                  onChange={(e) => {
                    const val = e.target.value;
                    onQueryParamsChange({
                      ...queryParams,
                      active: val === 'archived' ? false : val === 'all' ? undefined : true,
                      page: 0,
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="active">Active Products (Default)</option>
                  <option value="archived">Archived Products</option>
                  <option value="all">All (Active & Archived)</option>
                </select>
              </div>

              {/* Apply Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleApplyRangeFilters}
                  className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Apply Ranges
                </button>
              </div>
            </div>

            {/* Quick Stock Status Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-100/50">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Boxes className="h-3 w-3 text-slate-400" />
                Quick Stock Presets:
              </span>
              <button
                type="button"
                onClick={() => handleStockPreset('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  queryParams.minStock === undefined && queryParams.maxStock === undefined
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Stock Levels
              </button>
              <button
                type="button"
                onClick={() => handleStockPreset('IN_STOCK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  queryParams.minStock === 11 && queryParams.maxStock === undefined
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Healthy (&gt; 10)
              </button>
              <button
                type="button"
                onClick={() => handleStockPreset('LOW_STOCK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  queryParams.minStock === 1 && queryParams.maxStock === 10
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-50'
                }`}
              >
                Low (1 &ndash; 10)
              </button>
              <button
                type="button"
                onClick={() => handleStockPreset('OUT_OF_STOCK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  queryParams.minStock === 0 && queryParams.maxStock === 0
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                Out of Stock (0)
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Pill Bar */}
        {hasAnyFilter && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active:
            </span>

            {queryParams.nameOrCategoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Name/Cat: &ldquo;{queryParams.nameOrCategoryName}&rdquo;
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {queryParams.sku && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                SKU: {queryParams.sku}
                <button
                  type="button"
                  onClick={() => {
                    setSkuInput('');
                    onQueryParamsChange({ ...queryParams, sku: undefined, page: 0 });
                  }}
                  className="hover:text-indigo-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Category: {selectedCategoryObj.name}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('all')}
                  className="hover:text-purple-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Price: ${queryParams.minPrice ?? 0} &ndash; ${queryParams.maxPrice ?? '∞'}
                <button
                  type="button"
                  onClick={() => {
                    setMinPriceInput('');
                    setMaxPriceInput('');
                    onQueryParamsChange({
                      ...queryParams,
                      minPrice: undefined,
                      maxPrice: undefined,
                      page: 0,
                    });
                  }}
                  className="hover:text-blue-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(queryParams.minStock !== undefined || queryParams.maxStock !== undefined) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Stock: {queryParams.minStock ?? 0} &ndash; {queryParams.maxStock ?? '∞'}
                <button
                  type="button"
                  onClick={() => {
                    setMinStockInput('');
                    setMaxStockInput('');
                    onQueryParamsChange({
                      ...queryParams,
                      minStock: undefined,
                      maxStock: undefined,
                      page: 0,
                    });
                  }}
                  className="hover:text-emerald-900 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-0.5"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching products..." />
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={hasAnyFilter ? 'No products match your filters' : 'No products in catalog'}
              description={
                hasAnyFilter
                  ? 'Try adjusting your dynamic search terms, category, price, or stock range.'
                  : 'Start adding products with their base units to manage inventory.'
              }
              actionText={hasAnyFilter ? 'Clear All Filters' : 'Add Product'}
              onAction={() => {
                if (hasAnyFilter) {
                  handleResetFilters();
                } else {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }
              }}
              icon={<Package className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <tr>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors group"
                    onClick={() => handleSortChange('id')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ID</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors group"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors group"
                    onClick={() => handleSortChange('sku')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SKU</span>
                      {renderSortIcon('sku')}
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Base Unit</th>
                  <th className="px-6 py-3.5">Tax</th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors group"
                    onClick={() => handleSortChange('price')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Price</span>
                      {renderSortIcon('price')}
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Stock Balance</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4 min-w-0 max-w-[260px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate" title={product.name}>
                          {product.name}
                        </span>
                        {product.active === false && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700 font-mono uppercase">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate" title={product.description || undefined}>
                        {product.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 font-medium">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                        {product.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                        {product.baseUnitSymbol || 'PC'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.taxRate !== undefined && product.taxRate !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 font-mono">
                          {product.taxRate}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0%</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(product.price).toFixed(2)}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                        /{product.baseUnitSymbol || 'unit'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-800 text-xs">
                          {product.stock} {product.baseUnitSymbol || ''}
                        </span>
                        <StockBadge stock={product.stock} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {product.active === false ? (
                          <button
                            onClick={() => onRestoreProduct && onRestoreProduct(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
                            title="Restore Product to Active Catalog"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setManagingConversionsProduct(product)}
                              className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                              title="Configure Unit Conversions"
                            >
                              <Scale className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onOpenMovementModalForProduct(product)}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              title="Record Stock Movement"
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                              title="Archive Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination with Dynamic Page Size */}
        {pagedProducts && pagedProducts.totalElements > 0 && (
          <Pagination
            currentPage={pagedProducts.page}
            totalPages={pagedProducts.totalPages}
            totalElements={pagedProducts.totalElements}
            pageSize={queryParams.size || 10}
            onPageChange={(newPage) =>
              onQueryParamsChange({ ...queryParams, page: newPage })
            }
            onPageSizeChange={(newSize) =>
              onQueryParamsChange({ ...queryParams, size: newSize, page: 0 })
            }
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        categories={categories}
        units={units}
        taxRates={taxRates}
        isLoading={actionLoading}
      />

      {/* View Details Modal */}
      <ProductDetailsModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onRecordMovement={(prod) => {
          setViewingProduct(null);
          onOpenMovementModalForProduct(prod);
        }}
        onManageConversions={(prod) => {
          setViewingProduct(null);
          setManagingConversionsProduct(prod);
        }}
      />

      {/* Unit Conversions Modal */}
      <ProductConversionsModal
        isOpen={!!managingConversionsProduct}
        onClose={() => setManagingConversionsProduct(null)}
        product={managingConversionsProduct}
        units={units}
        onConversionUpdated={async () => {
          if (onRefreshProducts) {
            await onRefreshProducts();
          }
        }}
      />

      {/* Delete / Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title={`Archive product "${deletingProduct?.name}"?`}
        message={`Are you sure you want to archive "${deletingProduct?.name}" (${deletingProduct?.sku})? The product will be hidden from the active catalog and inventory tracking, but all historical stock movements, transactions, and audit records will remain safely preserved.`}
        confirmText="Archive Product"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
