import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FolderTree } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Content Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching categories..." />
        ) : filteredCategories.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={searchTerm ? 'No matching categories' : 'No categories yet'}
              description={
                searchTerm
                  ? `No categories match "${searchTerm}". Try a different keyword.`
                  : 'Start by creating your first category to group products.'
              }
              actionText={searchTerm ? undefined : 'Create Category'}
              onAction={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              icon={<FolderTree className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                      #{cat.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-md truncate">
                      {cat.description || <span className="italic text-slate-400">No description</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setIsFormOpen(true);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Category"
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
      </div>

      {/* Modals */}
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

      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Products assigned to this category might be affected.`}
        isLoading={actionLoading}
      />
    </div>
  );
};
