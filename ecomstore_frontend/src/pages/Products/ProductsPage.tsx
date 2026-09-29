import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  Filter,
  ArrowLeftRight,
  Scale,
  Package
} from 'lucide-react';
import type { Product, ProductCreateRequest, ProductUpdateRequest } from '../../types/product';
import type { Category } from '../../types/category';
import type { Unit } from '../../types/unit';
import type { PagedResponse, PaginationParams } from '../../types/api';
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
  isLoading: boolean;
  paginationParams: PaginationParams;
  onPaginationChange: (params: PaginationParams) => void;
  onCreateProduct: (data: ProductCreateRequest) => Promise<void>;
  onUpdateProduct: (id: number, data: ProductUpdateRequest) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onOpenMovementModalForProduct: (product: Product) => void;
  onRefreshProducts?: () => Promise<void>;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  pagedProducts,
  categories,
  units,
  isLoading,
  paginationParams,
  onPaginationChange,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenMovementModalForProduct,
  onRefreshProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [managingConversionsProduct, setManagingConversionsProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Client-side filtering on current page or search term
  const rawProducts = pagedProducts?.content || [];
  const displayProducts = rawProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'all' || product.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCat;
  });

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

  const handleSortChange = (sortBy: string) => {
    const isCurrentSort = paginationParams.sort === sortBy;
    const newDirection = isCurrentSort && paginationParams.direction === 'asc' ? 'desc' : 'asc';
    onPaginationChange({
      ...paginationParams,
      sort: sortBy,
      direction: newDirection,
      page: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name or SKU..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
        </div>

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

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching products..." />
        ) : displayProducts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm || selectedCategory !== 'all' ? 'No products match your filter' : 'No products in catalog'}
              description={
                searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or selecting a different category.'
                  : 'Start adding products with their base units to manage inventory.'
              }
              actionText="Add Product"
              onAction={() => {
                setEditingProduct(null);
                setIsFormOpen(true);
              }}
              icon={<Package className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Product</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Base Unit</th>
                  <th
                    className="px-6 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSortChange('price')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Price</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">
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
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-side Pagination */}
        {pagedProducts && pagedProducts.totalPages > 1 && (
          <Pagination
            currentPage={pagedProducts.page}
            totalPages={pagedProducts.totalPages}
            totalElements={pagedProducts.totalElements}
            pageSize={paginationParams.size || 10}
            onPageChange={(newPage) =>
              onPaginationChange({ ...paginationParams, page: newPage })
            }
            onPageSizeChange={(newSize) =>
              onPaginationChange({ ...paginationParams, size: newSize, page: 0 })
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete product "${deletingProduct?.name}"?`}
        message={`Are you sure you want to permanently delete product "${deletingProduct?.name}" (${deletingProduct?.sku})? This will also remove inventory and historical records.`}
        confirmText="Delete Product"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
