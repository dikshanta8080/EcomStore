import React from 'react';
import { Menu, RefreshCw, Sun, Moon, LogOut, ArrowLeft } from 'lucide-react';
import type { NavTab } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

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
  const { user, logout, activeTenantSlug, setActiveTenantSlug } = useAuth();

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    'superadmin-tenants': {
      title: 'SaaS Multi-Tenant Management',
      subtitle: 'Provision isolated PostgreSQL schemas and control tenant lifecycle',
    },
    'tenant-admin': {
      title: 'Store Administration',
      subtitle: 'Manage team staff roles, catalog, and store configurations',
    },
    'inventory-manager': {
      title: 'Inventory & Logistics Hub',
      subtitle: 'Track warehouse stock, replenishment, and item movements',
    },
    'accountant-dashboard': {
      title: 'Accounting & Ledger',
      subtitle: 'Audit store sales, invoice tax liabilities, and payment methods',
    },
    'cashier-dashboard': {
      title: 'POS Register Terminal',
      subtitle: 'Checkout sales, split payments, and receipt issuance',
    },
    dashboard: {
      title: 'Store Operations',
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

  const current = titles[currentTab] || { title: 'Console', subtitle: 'Retail Store' };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold text-[10px] border border-purple-200">
            👑 Founder
          </span>
        );
      case 'TENANT_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-semibold text-[10px] border border-indigo-200">
            🏢 Tenant Admin
          </span>
        );
      case 'INVENTORY_MANAGER':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
            📦 Inventory Mgr
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-[10px] border border-amber-200">
            📊 Accountant
          </span>
        );
      case 'CASHIER':
        return (
          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold text-[10px] border border-sky-200">
            💳 Cashier
          </span>
        );
      default:
        return null;
    }
  };

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
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {current.title}
            </h2>
            {user?.role === 'SUPER_ADMIN' && activeTenantSlug && (
              <button
                onClick={() => setActiveTenantSlug(null)}
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-100"
              >
                <ArrowLeft className="w-3 h-3" />
                Return to Master Console
              </button>
            )}
          </div>
          <p className="hidden sm:block text-[11px] text-slate-500">{current.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* User profile snippet */}
        <div className="hidden md:flex items-center gap-2 pr-2 border-r border-slate-200 text-right">
          <div>
            <div className="text-xs font-bold text-slate-900 leading-none">{user?.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
              {user?.companyName ? user.companyName : user?.email}
            </div>
          </div>
          {getRoleBadge()}
        </div>

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

        {/* Logout */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          title="Sign out of system"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
