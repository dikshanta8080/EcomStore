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
  Percent,
  ShoppingCart
} from 'lucide-react';

export type NavTab = 'dashboard' | 'pos' | 'products' | 'categories' | 'units' | 'inventory' | 'movements' | 'tax-rates';

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
  const navSections: {
    title: string;
    items: { id: NavTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[];
  }[] = [
    {
      title: 'Operations',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          id: 'pos',
          label: 'POS Register',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Catalog',
      items: [
        {
          id: 'products',
          label: 'Products',
          icon: <Package className="h-4 w-4" />,
        },
        {
          id: 'categories',
          label: 'Categories',
          icon: <FolderTree className="h-4 w-4" />,
        },
        {
          id: 'units',
          label: 'Units & Measures',
          icon: <Scale className="h-4 w-4" />,
        },
        {
          id: 'tax-rates',
          label: 'Tax Rates',
          icon: <Percent className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Inventory',
      items: [
        {
          id: 'inventory',
          label: 'Stock Levels',
          icon: <Boxes className="h-4 w-4" />,
          badge:
            lowStockCount > 0 ? (
              <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                {lowStockCount} low
              </span>
            ) : null,
        },
        {
          id: 'movements',
          label: 'Stock Movements',
          icon: <ArrowLeftRight className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                Retail Store
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">
                Admin Console
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-5 px-3 py-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* System info footer */}
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600 truncate">Connected to API</span>
          </div>
        </div>
      </aside>
    </>
  );
};
