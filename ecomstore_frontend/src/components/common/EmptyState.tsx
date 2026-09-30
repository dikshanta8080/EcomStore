import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/40 p-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-400 shadow-xs">
        {icon || <PackageOpen className="h-5 w-5 text-slate-400" />}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
