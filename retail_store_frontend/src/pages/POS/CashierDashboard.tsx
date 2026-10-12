import React from 'react';
import { ShoppingCart, Clock } from 'lucide-react';
import { PosPage } from './PosPage';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import { useAuth } from '../../context/AuthContext';

interface CashierDashboardProps {
  products: Product[];
  categories: Category[];
  onRefreshData: () => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({
  products,
  categories,
  onRefreshData,
  addToast,
}) => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* Cashier Shift Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Cashier Checkout Register</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                REGISTER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cashier: <strong className="text-white">{user?.name}</strong> | Terminal ID: #POS-01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Shift Started: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Embedded POS Interface */}
      <PosPage
        products={products}
        categories={categories}
        onRefreshData={onRefreshData}
        addToast={addToast}
      />
    </div>
  );
};
