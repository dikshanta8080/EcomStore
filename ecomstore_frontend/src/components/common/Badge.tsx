import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20',
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const StockBadge: React.FC<{ stock: number | null | undefined }> = ({ stock }) => {
  const count = stock ?? 0;
  if (count <= 0) {
    return <Badge variant="danger">Out of Stock ({count})</Badge>;
  }
  if (count <= 10) {
    return <Badge variant="warning">Low Stock ({count})</Badge>;
  }
  return <Badge variant="success">In Stock ({count})</Badge>;
};

export const MovementTypeBadge: React.FC<{ type: 'IN' | 'OUT' }> = ({ type }) => {
  if (type === 'IN') {
    return <Badge variant="success">+ IN (Restock)</Badge>;
  }
  return <Badge variant="danger">- OUT (Dispatch)</Badge>;
};
