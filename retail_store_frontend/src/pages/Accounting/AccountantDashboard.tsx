import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Loader2
} from 'lucide-react';
import { saleService } from '../../api/saleService';
import type { SaleResponse } from '../../types/sale';
import { getErrorMessage } from '../../api/client';

interface AccountantDashboardProps {
  onNavigate: (tab: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await saleService.getAllSales({ size: 100 });
        setSales(res.content || []);
      } catch (err) {
        onShowToast('error', getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [onShowToast]);

  // Aggregate accounting metrics
  const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalTax = sales.reduce((acc, s) => acc + (s.tax || 0), 0);
  const totalDiscount = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const completedSales = sales.filter((s) => s.status === 'COMPLETED').length;
  const pendingSales = sales.filter((s) => s.status === 'PENDING').length;
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-900/40 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Store Accountant
            </span>
            <span className="text-xs text-slate-400">Financial Reports & Audit Ledger</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Accounting & Revenue Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Audit store invoices, tax liability, payment settlements, and sales margins.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('tax-rates')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Tax Schedules</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Across {sales.length} transactions</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tax Collected</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">${totalTax.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Sales tax liability</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Discounts Applied</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">${totalDiscount.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total promotions given</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">${avgOrderValue.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Per transaction average</div>
        </div>
      </div>

      {/* Invoice Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Invoices & Sales Ledger</h3>
            <p className="text-xs text-slate-500">Live transaction records generated by POS terminals</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {completedSales} Completed
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {pendingSales} Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Tax</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-amber-600" />
                    <span>Loading sales ledger...</span>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No sales recorded yet. Register transactions via POS.
                  </td>
                </tr>
              ) : (
                sales.slice(0, 15).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.invoiceNumber ? s.invoiceNumber.substring(0, 8).toUpperCase() : `#${s.id}`}
                    </td>
                    <td className="py-3 px-4 text-slate-700">${s.subTotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-amber-600">+${s.tax.toFixed(2)}</td>
                    <td className="py-3 px-4 text-rose-500">-${s.discount.toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${s.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
