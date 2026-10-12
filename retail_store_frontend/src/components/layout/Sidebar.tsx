import React from 'react';
import {
  Package,
  FolderTree,
  Boxes,
  ArrowLeftRight,
  Scale,
  Store,
  X,
  Percent,
  ShoppingCart,
  Building2,
  Users,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'superadmin-tenants'
  | 'tenant-admin'
  | 'inventory-manager'
  | 'accountant-dashboard'
  | 'cashier-dashboard'
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'categories'
  | 'units'
  | 'inventory'
  | 'movements'
  | 'tax-rates';

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
  const { user, activeTenantSlug } = useAuth();
  const role = user?.role;

  // Build role-tailored navigation items
  const navSections: {
    title: string;
    items: { id: NavTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[];
  }[] = [];

  if (role === 'SUPER_ADMIN') {
    navSections.push({
      title: 'SaaS Platform Master',
      items: [
        {
          id: 'superadmin-tenants',
          label: 'Client Tenants & Schemas',
          icon: <Building2 className="h-4 w-4" />,
        },
      ],
    });

    if (activeTenantSlug) {
      navSections.push({
        title: `Inspecting [${activeTenantSlug}]`,
        items: [
          {
            id: 'tenant-admin',
            label: 'Store & Team Members',
            icon: <Users className="h-4 w-4" />,
          },
          {
            id: 'pos',
            label: 'POS Register',
            icon: <ShoppingCart className="h-4 w-4" />,
          },
          {
            id: 'products',
            label: 'Products',
            icon: <Package className="h-4 w-4" />,
          },
          {
            id: 'inventory',
            label: 'Stock Levels',
            icon: <Boxes className="h-4 w-4" />,
            badge: lowStockCount > 0 ? (
              <span className="ml-auto rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                {lowStockCount}
              </span>
            ) : null,
          },
          {
            id: 'accountant-dashboard',
            label: 'Financial Ledger',
            icon: <Receipt className="h-4 w-4" />,
          },
        ],
      });
    }
  } else if (role === 'TENANT_ADMIN') {
    navSections.push(
      {
        title: 'Store Administration',
        items: [
          {
            id: 'tenant-admin',
            label: 'Store & Team Members',
            icon: <Users className="h-4 w-4" />,
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
        title: 'Warehouse & Accounting',
        items: [
          {
            id: 'inventory',
            label: 'Stock Levels',
            icon: <Boxes className="h-4 w-4" />,
            badge: lowStockCount > 0 ? (
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
          {
            id: 'accountant-dashboard',
            label: 'Sales & Invoices',
            icon: <Receipt className="h-4 w-4" />,
          },
        ],
      }
    );
  } else if (role === 'INVENTORY_MANAGER') {
    navSections.push(
      {
        title: 'Inventory Control',
        items: [
          {
            id: 'inventory-manager',
            label: 'Inventory Dashboard',
            icon: <Boxes className="h-4 w-4" />,
          },
          {
            id: 'inventory',
            label: 'Stock Levels',
            icon: <Boxes className="h-4 w-4" />,
            badge: lowStockCount > 0 ? (
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
      {
        title: 'Catalog Taxonomy',
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
        ],
      }
    );
  } else if (role === 'ACCOUNTANT') {
    navSections.push({
      title: 'Accounting & Finance',
      items: [
        {
          id: 'accountant-dashboard',
          label: 'Financial Ledger',
          icon: <Receipt className="h-4 w-4" />,
        },
        {
          id: 'tax-rates',
          label: 'Tax Schedules',
          icon: <Percent className="h-4 w-4" />,
        },
      ],
    });
  } else if (role === 'CASHIER') {
    navSections.push({
      title: 'Sales Terminal',
      items: [
        {
          id: 'cashier-dashboard',
          label: 'POS Register',
          icon: <ShoppingCart className="h-4 w-4" />,
        },
      ],
    });
  }

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
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                {user?.companyName || 'Retail SaaS'}
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">
                {user?.schemaName ? `Schema: ${user.schemaName}` : 'Master Platform'}
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
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
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

        {/* Active context footer */}
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-600 truncate">
              {user?.role?.replace('_', ' ')} active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
