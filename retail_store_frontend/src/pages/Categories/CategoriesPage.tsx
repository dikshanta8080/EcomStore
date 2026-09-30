import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree, X } from 'lucide-react';
import type { Category, CategoryRequest } from '../../types/category';
import { CategoryFormModal } from './CategoryFormModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface CategoriesPageProps {
  categories: Category[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreateCategory: (data: CategoryRequest) => Promise<void>;
  onUpdateCategory: (id: number, data: CategoryRequest) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  categories,
  isLoading,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateOrUpdate = async (data: CategoryRequest) => {
    setActionLoading(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, data);
      } else {
        await onCreateCategory(data);
      }
      setIsFormOpen(false);
      setEditingCategory(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setActionLoading(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog products into hierarchical groups and departments
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Category
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching categories..." />
        ) : filteredCategories.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm ? 'No matching categories' : 'No categories created'}
              description={
                searchTerm
                  ? `No categories match "${searchTerm}".`
                  : 'Get started by creating your first product category.'
              }
              actionText={searchTerm ? undefined : 'Add Category'}
              onAction={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              icon={<FolderTree className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{cat.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-md truncate">
                      {cat.description || <span className="text-slate-400 italic">No description</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsFormOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleCreateOrUpdate}
        category={editingCategory}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete category "${deletingCategory?.name}"?`}
        message={`Are you sure you want to delete "${deletingCategory?.name}"? If any products are currently assigned to this category, deletion will be blocked.`}
        confirmText="Delete Category"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
