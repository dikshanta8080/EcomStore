import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import type { Category, CategoryRequest } from '../../types/category';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  category?: Category | null;
  isLoading?: boolean;
}

const CategoryFormContent: React.FC<{
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => Promise<void>;
  category?: Category | null;
  isLoading?: boolean;
}> = ({ onClose, onSubmit, category, isLoading = false }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Category Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics, Footwear, Home & Kitchen"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the category..."
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
          {category ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
};

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create New Category'}
      subtitle={category ? `Updating category #${category.id}` : 'Add a category to organize your products'}
      maxWidth="md"
    >
      <CategoryFormContent
        key={category ? `edit-${category.id}` : 'new'}
        onClose={onClose}
        onSubmit={onSubmit}
        category={category}
        isLoading={isLoading}
      />
    </Modal>
  );
};
