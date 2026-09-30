import React from 'react';
import { Menu, RefreshCw, Sun, Moon } from 'lucide-react';
import type { NavTab } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of stock, movements, and store performance',
    },
    pos: {
      title: 'Point of Sale',
      subtitle: 'Register orders, accept split tender, and manage sales logs',
    },
    products: {
      title: 'Products',
      subtitle: 'Manage inventory items, pricing, tax rates, and units',
    },
    categories: {
      title: 'Categories',
      subtitle: 'Organize catalog taxonomy and product groupings',
    },
    units: {
      title: 'Units of Measure',
      subtitle: 'Manage measurement standards and conversion factors',
    },
    inventory: {
      title: 'Inventory Status',
      subtitle: 'Real-time warehouse stock tracking and shortage alerts',
    },
    movements: {
      title: 'Stock Movements',
      subtitle: 'Audit log of stock intake and order dispatches',
    },
    'tax-rates': {
      title: 'Tax Rates',
      subtitle: 'Configure VAT and sales tax percentages applied to products',
    },
  };

  const current = titles[currentTab];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden cursor-pointer"
          title="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {current.title}
          </h2>
          <p className="hidden sm:block text-[11px] text-slate-500">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
};
