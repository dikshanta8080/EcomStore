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
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Category Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics, Footwear, Groceries"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes or details about the category..."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3.5 mt-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
      title={category ? 'Edit Category' : 'New Category'}
      subtitle={category ? `Updating category #${category.id}` : 'Create a category to group products'}
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
