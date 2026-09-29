import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ArrowLeftRight,
  Scale,
  Store,
  X,
  Percent
} from 'lucide-react';

export type NavTab = 'dashboard' | 'products' | 'categories' | 'units' | 'inventory' | 'movements' | 'tax-rates';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  lowStockCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isOpen,
  onClose,
  lowStockCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      id: 'units',
      label: 'Units & Measures',
      icon: <Scale className="h-5 w-5" />,
    },
    {
      id: 'tax-rates',
      label: 'Tax Rates',
      icon: <Percent className="h-5 w-5" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="h-5 w-5" />,
      badge: lowStockCount > 0 ? (
        <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-500/30">
          {lowStockCount} low
        </span>
      ) : null,
    },
    {
      id: 'movements',
      label: 'Inventory Movements',
      icon: <ArrowLeftRight className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                EcomStore
              </h1>
              <span className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">
                Admin Panel
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Store Management
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span
                  className={`${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge}
              </button>
            );
          })}
        </nav>

        {/* System info footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200/60 shadow-2xs">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-slate-800">Connected to API</p>
              <p className="text-[11px] text-slate-400 truncate">Port 8080 • Context /api</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
