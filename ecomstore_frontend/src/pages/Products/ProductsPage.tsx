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
  SlidersHorizontal,
  ArrowLeftRight,
  Scale,
  Package,
  X,
  RotateCcw,
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
    }, 300);
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
    }, 300);
  };

  const handleCategoryChange = (catIdStr: string) => {
    const categoryId = catIdStr === 'all' ? undefined : Number(catIdStr);
    onQueryParamsChange({
      ...queryParams,
      categoryId,
      page: 0,
    });
  };

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

  const activeFilterCount = [
    Boolean(queryParams.nameOrCategoryName),
    Boolean(queryParams.sku),
    queryParams.categoryId !== undefined,
    queryParams.minPrice !== undefined || queryParams.maxPrice !== undefined,
    queryParams.minStock !== undefined || queryParams.maxStock !== undefined,
    queryParams.active !== undefined,
  ].filter(Boolean).length;

  const hasAnyFilter = activeFilterCount > 0;
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

  // Determine current active stock tab
  const isHealthyPreset = queryParams.minStock === 11 && queryParams.maxStock === undefined;
  const isLowPreset = queryParams.minStock === 1 && queryParams.maxStock === 10;
  const isOutPreset = queryParams.minStock === 0 && queryParams.maxStock === 0;
  const isAllPreset = !isHealthyPreset && !isLowPreset && !isOutPreset;

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inventory items, pricing, SKU codes, and stock balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSeedData && (
            <button
              onClick={onSeedData}
              title="Generate sample products for testing"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Seed Sample Products
            </button>
          )}

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Streamlined Status Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto text-xs font-medium">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStockPreset('ALL')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              isAllPreset
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All Products{' '}
            <span className="ml-1 text-[11px] font-mono text-slate-400">
              ({summary ? summary.totalProducts : pagedProducts?.totalElements ?? 0})
            </span>
          </button>

          <button
            onClick={() => handleStockPreset('IN_STOCK')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              isHealthyPreset
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            In Stock{' '}
            <span className="ml-1 text-[11px] font-mono text-slate-400">
              ({summary?.healthyStockCount ?? 0})
            </span>
          </button>

          <button
            onClick={() => handleStockPreset('LOW_STOCK')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              isLowPreset
                ? 'border-amber-500 text-amber-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Low Stock{' '}
            <span className="ml-1 text-[11px] font-mono text-slate-400">
              ({summary?.lowStockCount ?? 0})
            </span>
          </button>

          <button
            onClick={() => handleStockPreset('OUT_OF_STOCK')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              isOutPreset
                ? 'border-rose-600 text-rose-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Out of Stock{' '}
            <span className="ml-1 text-[11px] font-mono text-slate-400">
              ({summary?.outOfStockCount ?? 0})
            </span>
          </button>
        </div>

        {summary && (
          <div className="hidden md:block text-[11px] text-slate-500 pr-2">
            Total Inventory:{' '}
            <span className="font-semibold text-slate-700">
              {Number(summary.totalStockUnits).toLocaleString()} units
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex flex-1 items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search product name or category..."
                className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative min-w-[140px]">
              <select
                value={queryParams.categoryId !== undefined ? String(queryParams.categoryId) : 'all'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                showAdvancedFilters || hasAnyFilter
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </button>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Filter by SKU</label>
              <input
                type="text"
                value={skuInput}
                onChange={(e) => handleSkuChange(e.target.value)}
                placeholder="SKU-101"
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Price Range (Rs.)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Status</label>
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
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
              >
                <option value="active">Active Products</option>
                <option value="archived">Archived Products</option>
                <option value="all">All (Active & Archived)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleApplyRangeFilters}
                className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Apply Range Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching products..." />
        ) : products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={hasAnyFilter ? 'No products match filters' : 'Catalog is empty'}
              description={
                hasAnyFilter
                  ? 'Try clearing or relaxing your search and filter criteria.'
                  : 'Get started by creating your first product.'
              }
              actionText={hasAnyFilter ? 'Reset Filters' : 'Add Product'}
              onAction={() => {
                if (hasAnyFilter) {
                  handleResetFilters();
                } else {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }
              }}
              icon={<Package className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                    onClick={() => handleSortChange('id')}
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Product</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                    onClick={() => handleSortChange('sku')}
                  >
                    <div className="flex items-center gap-1">
                      <span>SKU</span>
                      {renderSortIcon('sku')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Unit</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 group"
                    onClick={() => handleSortChange('price')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      {renderSortIcon('price')}
                    </div>
                  </th>
                  <th className="py-3 px-4">Stock Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{product.id}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate" title={product.name}>
                          {product.name}
                        </span>
                        {product.active === false && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono text-slate-700 uppercase">
                            Archived
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5" title={product.description}>
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {product.categoryName || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {product.baseUnitSymbol || 'PC'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      Rs. {Number(product.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-800">
                          {product.stock} {product.baseUnitSymbol || ''}
                        </span>
                        <StockBadge stock={product.stock} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {product.active === false ? (
                          <button
                            onClick={() => onRestoreProduct && onRestoreProduct(product.id)}
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Restore Product"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => onOpenMovementModalForProduct(product)}
                              className="rounded p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Record Stock Movement"
                            >
                              <ArrowLeftRight className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setManagingConversionsProduct(product)}
                              className="rounded p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Unit Conversions"
                            >
                              <Scale className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                              }}
                              className="rounded p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Archive Product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        {/* Server-side Pagination */}
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

      {/* Product Form Modal */}
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

      {/* Archive / Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title={`Archive "${deletingProduct?.name}"?`}
        message={`Are you sure you want to archive "${deletingProduct?.name}" (${deletingProduct?.sku})? The product will be hidden from the active catalog, but all historical stock movements, transactions, and audit records will remain preserved.`}
        confirmText="Archive Product"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
