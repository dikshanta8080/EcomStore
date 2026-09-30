import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Search,
  RefreshCw,
  X,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import type {
  PaymentResponse,
  PaymentSummary,
  PaymentQueryParams,
  PaymentMethod,
  PaymentStatus,
} from '../../types/payment';
import type { PagedResponse } from '../../types/api';
import { paymentService } from '../../api/paymentService';
import { getErrorMessage } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';

export const PaymentsDashboardSection: React.FC = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [pagedPayments, setPagedPayments] = useState<PagedResponse<PaymentResponse> | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [queryParams, setQueryParams] = useState<PaymentQueryParams>({
    page: 0,
    size: 5,
    sort: 'createdAt',
    direction: 'desc',
    search: '',
    paymentMethod: undefined,
    status: undefined,
    startDate: '',
    endDate: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const data = await paymentService.getPaymentSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load payment summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    setIsLoadingPayments(true);
    setErrorMessage(null);
    try {
      const data = await paymentService.getAllPayments(queryParams);
      setPagedPayments(data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsLoadingPayments(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleResetFilters = () => {
    setQueryParams({
      page: 0,
      size: 5,
      sort: 'createdAt',
      direction: 'desc',
      search: '',
      paymentMethod: undefined,
      status: undefined,
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const hasAdvancedFilters = Boolean(
    queryParams.startDate ||
      queryParams.endDate ||
      queryParams.minAmount !== undefined ||
      queryParams.maxAmount !== undefined
  );

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-3 w-3 text-emerald-600" />;
      case 'ESEWA':
        return <QrCode className="h-3 w-3 text-green-600" />;
      case 'KHALTI':
        return <Smartphone className="h-3 w-3 text-purple-600" />;
      case 'CARD':
        return <CreditCard className="h-3 w-3 text-blue-600" />;
      default:
        return <Smartphone className="h-3 w-3 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indigo-600" />
            Payments & Settlement Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs for settlements, multi-method tender splits, and payment breakdown
          </p>
        </div>
        <button
          onClick={() => {
            fetchSummary();
            fetchPayments();
          }}
          disabled={isLoadingPayments || isLoadingSummary}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw
            className={`h-3 w-3 ${isLoadingPayments || isLoadingSummary ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Unified Revenue & Payment Channels Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Hero Left: Total Revenue */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <Wallet className="h-3.5 w-3.5 text-indigo-600" />
              <span>Total Revenue Settled</span>
            </div>
            <p className="mt-2 text-2xl font-bold font-mono text-slate-900 tracking-tight">
              Rs. {summary ? Number(summary.totalRevenue).toFixed(2) : '0.00'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {summary ? summary.totalTransactions : 0}
              </span>{' '}
              completed transactions recorded
            </p>
          </div>

          {/* Right Breakdown: Clean Channels Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Cash */}
            <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Banknote className="h-3 w-3 text-emerald-600" />
                <span>Cash</span>
              </div>
              <p className="mt-1 text-xs font-bold font-mono text-slate-800">
                Rs. {summary ? Number(summary.cashTotal).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* eSewa */}
            <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <QrCode className="h-3 w-3 text-green-600" />
                <span>eSewa</span>
              </div>
              <p className="mt-1 text-xs font-bold font-mono text-slate-800">
                Rs. {summary ? Number(summary.esewaTotal).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Khalti */}
            <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Smartphone className="h-3 w-3 text-purple-600" />
                <span>Khalti</span>
              </div>
              <p className="mt-1 text-xs font-bold font-mono text-slate-800">
                Rs. {summary ? Number(summary.khaltiTotal).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Card */}
            <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <CreditCard className="h-3 w-3 text-blue-600" />
                <span>Card</span>
              </div>
              <p className="mt-1 text-xs font-bold font-mono text-slate-800">
                Rs. {summary ? Number(summary.cardTotal).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Mobile Banking */}
            <div className="rounded-lg bg-slate-50/70 border border-slate-100 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Smartphone className="h-3 w-3 text-slate-500" />
                <span>Banking</span>
              </div>
              <p className="mt-1 text-xs font-bold font-mono text-slate-800">
                Rs. {summary ? Number(summary.mobileBankingTotal).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filter Controls & Paginated Payments Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        {/* Streamlined Filter Bar */}
        <div className="p-3.5 bg-slate-50/50 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Txn ID..."
                value={queryParams.search || ''}
                onChange={(e) =>
                  setQueryParams((prev) => ({ ...prev, search: e.target.value, page: 0 }))
                }
                className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Method Filter Pills & Advanced Toggle */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {(
                [
                  { label: 'All', value: undefined },
                  { label: 'Cash', value: 'CASH' },
                  { label: 'eSewa', value: 'ESEWA' },
                  { label: 'Khalti', value: 'KHALTI' },
                  { label: 'Card', value: 'CARD' },
                ] as const
              ).map((m) => (
                <button
                  key={m.label}
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      paymentMethod: m.value as PaymentMethod | undefined,
                      page: 0,
                    }))
                  }
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                    queryParams.paymentMethod === m.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  showAdvancedFilters || hasAdvancedFilters
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Filters</span>
                {hasAdvancedFilters && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Status</label>
                <select
                  value={queryParams.status || ''}
                  onChange={(e) =>
                    setQueryParams((prev) => ({
                      ...prev,
                      status: (e.target.value as PaymentStatus) || undefined,
                      page: 0,
                    }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={queryParams.startDate || ''}
                  onChange={(e) =>
                    setQueryParams((prev) => ({ ...prev, startDate: e.target.value, page: 0 }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={queryParams.endDate || ''}
                  onChange={(e) =>
                    setQueryParams((prev) => ({ ...prev, endDate: e.target.value, page: 0 }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end gap-1.5">
                <div className="flex-1">
                  <label className="block text-[10px] text-slate-400 mb-1">Min Rs.</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={queryParams.minAmount ?? ''}
                    onChange={(e) =>
                      setQueryParams((prev) => ({
                        ...prev,
                        minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        page: 0,
                      }))
                    }
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                  />
                </div>
                {hasAdvancedFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700"
                    title="Reset filters"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        {isLoadingPayments ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : errorMessage ? (
          <div className="p-6 text-center text-xs text-red-600">{errorMessage}</div>
        ) : !pagedPayments || pagedPayments.content.length === 0 ? (
          <EmptyState
            title="No payments found"
            description="No transactions match the selected filters."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Payment ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Sale ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Split Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pagedPayments.content.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {p.paymentId.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(p.paymentTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">#{p.saleId}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        Rs. {Number(p.paidAmount || p.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3" />
                            COMPLETED
                          </span>
                        ) : p.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                            <Clock className="h-3 w-3" />
                            PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200/60">
                            <AlertCircle className="h-3 w-3" />
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.subPayments && p.subPayments.length > 0 ? (
                            p.subPayments.map((sub, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-mono font-medium border border-slate-300 dark:border-slate-700 shadow-2xs"
                              >
                                {getMethodIcon(sub.paymentMethod)}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.paymentMethod}:</span>
                                <span className="font-bold text-slate-900 dark:text-white">Rs. {Number(sub.amount).toFixed(2)}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Server-Side Pagination */}
            <Pagination
              currentPage={pagedPayments.page}
              totalPages={pagedPayments.totalPages}
              totalElements={pagedPayments.totalElements}
              pageSize={pagedPayments.size}
              onPageChange={(newPage) =>
                setQueryParams((prev) => ({ ...prev, page: newPage }))
              }
              onPageSizeChange={(newSize) =>
                setQueryParams((prev) => ({ ...prev, size: newSize, page: 0 }))
              }
            />
          </>
        )}
      </div>
    </div>
  );
};
