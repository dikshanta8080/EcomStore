import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSidebar: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSidebar,
  onRefresh,
  isRefreshing = false,
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Store Dashboard',
      subtitle: 'Overview of products, stock levels, and latest movements',
    },
    products: {
      title: 'Products Management',
      subtitle: 'Create, update, view, and organize products catalog',
    },
    categories: {
      title: 'Product Categories',
      subtitle: 'Manage categories and organize your catalog taxonomy',
    },
    units: {
      title: 'Units & Measures',
      subtitle: 'Manage standard and custom units of measure and conversions',
    },
    inventory: {
      title: 'Inventory Status',
      subtitle: 'Monitor live warehouse stock levels and shortage alerts',
    },
    movements: {
      title: 'Inventory Movements',
      subtitle: 'Track incoming restocks and outgoing orders dispatch',
    },
  };

  const current = titles[currentTab];

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          title="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
            {current.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="Refresh current data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
};
