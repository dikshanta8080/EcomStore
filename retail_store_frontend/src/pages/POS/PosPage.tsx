import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  History,
  Store,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ReceiptText,
  SlidersHorizontal,
  X
} from 'lucide-react';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import type { SaleResponse, SaleRequest, SaleStatus, SaleQueryParams } from '../../types/sale';
import type { PaymentResponse } from '../../types/payment';
import type { PagedResponse } from '../../types/api';
import { saleService } from '../../api/saleService';
import { getErrorMessage } from '../../api/client';
import { CheckoutModal } from './CheckoutModal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';

interface CartItem {
  product: Product;
  quantity: number;
}

interface PosPageProps {
  products: Product[];
  categories: Category[];
  onRefreshData: () => Promise<void>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const PosPage: React.FC<PosPageProps> = ({
  products,
  categories,
  onRefreshData,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // Active Sale for Checkout Modal
  const [activeSaleForCheckout, setActiveSaleForCheckout] = useState<SaleResponse | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Sales History State
  const [pagedSales, setPagedSales] = useState<PagedResponse<SaleResponse> | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [historyParams, setHistoryParams] = useState<SaleQueryParams>({
    page: 0,
    size: 10,
    sort: 'createdAt',
    direction: 'desc',
    search: '',
    status: undefined,
    minTotal: undefined,
    maxTotal: undefined,
    startDate: '',
    endDate: '',
  });

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory =
        selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId;
      const isActive = p.active !== false;
      return matchesSearch && matchesCategory && isActive;
    });
  }, [products, catalogSearch, selectedCategoryId]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartEstimatedTax = useMemo(() => {
    return cart.reduce((sum, item) => {
      const taxRate = item.product.taxRate || 0;
      const lineTotal = item.product.price * item.quantity;
      return sum + (lineTotal * taxRate) / 100;
    }, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount + cartEstimatedTax);
  }, [cartSubtotal, discountAmount, cartEstimatedTax]);

  // Fetch Sales History with dynamic filtering and server pagination
  const fetchSalesHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const paged = await saleService.getAllSales(historyParams);
      setPagedSales(paged);
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [historyParams, addToast]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSalesHistory();
    }
  }, [activeTab, fetchSalesHistory]);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      addToast('error', `Cannot add '${product.name}' - Out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          addToast('info', `Maximum available stock reached for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              addToast('info', `Stock limit reached (${item.product.stock})`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

  // Create Sale Action
  const handleCreateSale = async () => {
    if (cart.length === 0) {
      addToast('error', 'Cart is empty. Add products to create a sale.');
      return;
    }

    setIsSubmittingSale(true);
    try {
      const request: SaleRequest = {
        discountAmount: Number(discountAmount) || 0,
        saleItems: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await saleService.createSale(request);
      addToast('success', `Sale created! Total: Rs. ${Number(response.total).toFixed(2)}`);

      // Open checkout modal with newly created pending sale
      setActiveSaleForCheckout(response);
      setIsCheckoutModalOpen(true);

      // Refresh product stock
      await onRefreshData();
      if (activeTab === 'history') {
        fetchSalesHistory();
      }
    } catch (err) {
      addToast('error', getErrorMessage(err));
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handlePaymentSuccess = async (_payment: PaymentResponse, updatedSale: SaleResponse) => {
    addToast('success', `Invoice #${updatedSale.invoiceNumber.substring(0, 8)} paid successfully!`);
    handleClearCart();
    await onRefreshData();
    if (activeTab === 'history') {
      fetchSalesHistory();
    }
  };

  const handleResumeCheckout = (sale: SaleResponse) => {
    setActiveSaleForCheckout(sale);
    setIsCheckoutModalOpen(true);
  };

  const handleResetHistoryFilters = () => {
    setHistoryParams({
      page: 0,
      size: 10,
      sort: 'createdAt',
      direction: 'desc',
      search: '',
      status: undefined,
      minTotal: undefined,
      maxTotal: undefined,
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveAdvancedFilters = Boolean(
    historyParams.startDate ||
      historyParams.endDate ||
      historyParams.minTotal !== undefined ||
      historyParams.maxTotal !== undefined
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-indigo-600" />
            Point of Sale
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register cashier orders, accept split payments, and review sales logs
          </p>
        </div>

        {/* Minimal Pill Segment Control */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/50">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>POS Register</span>
            {cart.length > 0 && (
              <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Sales History</span>
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        /* POS Layout: 2 Columns (Catalog on Left, Cart on Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Catalog */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Search and Category Filter Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Minimal Category Filter Strip */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center text-xs">
                <button
                  onClick={() => setSelectedCategoryId('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategoryId === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Products Grid */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try searching with a different term or select another category."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find((item) => item.product.id === p.id);
                  const inStock = p.stock > 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => inStock && handleAddToCart(p)}
                      className={`group flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                        inStock
                          ? 'border-slate-200/70 bg-white hover:border-indigo-200 hover:shadow-xs cursor-pointer'
                          : 'border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        {/* Top Category & Stock Status */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <span className="font-medium truncate max-w-[120px]">
                            {p.categoryName || 'General'}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.stock > 10
                                  ? 'bg-emerald-500'
                                  : p.stock > 0
                                  ? 'bg-amber-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span className={inStock ? 'text-slate-600' : 'text-slate-400'}>
                              {inStock ? `${p.stock} in stock` : 'Out of stock'}
                            </span>
                          </span>
                        </div>

                        {/* Title and SKU */}
                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {p.sku}
                        </p>
                      </div>

                      {/* Bottom Price and Add Action */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Rs. {Number(p.price).toFixed(2)}
                        </span>

                        {inStock && (
                          <div className="flex items-center gap-1.5">
                            {inCartItem && (
                              <span className="text-[11px] font-bold font-mono text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50">
                                ×{inCartItem.quantity}
                              </span>
                            )}
                            <button
                              type="button"
                              className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Clean Cart Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 rounded-xl border border-slate-200/80 bg-white p-4 space-y-4 sticky top-6 shadow-xs">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-slate-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current Order ({cart.length})
                </h2>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1.5">
                <Package className="h-8 w-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-500">Cart is empty</p>
                <p className="text-[11px] text-slate-400">Select items from the catalog</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 -mx-1 px-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Rs. {Number(item.product.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Subtle Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-[11px] font-bold font-mono text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="h-6 w-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right font-mono text-xs font-bold text-slate-800 min-w-16">
                      Rs. {(item.product.price * item.quantity).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations & Checkout */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* Discount Row */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Discount (Rs.)</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-20 text-right text-xs font-mono rounded-lg border border-slate-200 py-1 px-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Clean Totals Box */}
                <div className="rounded-xl bg-slate-50/70 p-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-800">Rs. {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {cartEstimatedTax > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Est. Tax</span>
                      <span className="font-mono">+ Rs. {cartEstimatedTax.toFixed(2)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-mono">- Rs. {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Due</span>
                    <span className="font-mono text-indigo-600 font-extrabold text-base">
                      Rs. {cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Create Sale / Proceed */}
                <button
                  type="button"
                  onClick={handleCreateSale}
                  disabled={isSubmittingSale || cart.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingSale ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Creating Sale...
                    </>
                  ) : (
                    <>
                      Create Sale & Checkout
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sales History View (Strictly Read-Only with Clean, Non-Congested Filters) */
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-indigo-600" />
                Sales History (Audit Log)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable order history. Inspect bills or proceed with pending payments.
              </p>
            </div>
            <button
              onClick={fetchSalesHistory}
              disabled={isHistoryLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${isHistoryLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Minimalist Filter Bar */}
          <div className="p-3.5 bg-slate-50/50 border-b border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice number..."
                  value={historyParams.search || ''}
                  onChange={(e) =>
                    setHistoryParams((prev) => ({ ...prev, search: e.target.value, page: 0 }))
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter Quick Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {(['', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                  <button
                    key={st || 'ALL'}
                    onClick={() =>
                      setHistoryParams((prev) => ({
                        ...prev,
                        status: st ? (st as SaleStatus) : undefined,
                        page: 0,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                      (historyParams.status || '') === st
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st === '' ? 'All Status' : st}
                  </button>
                ))}

                {/* Filter Toggle for Date / Price */}
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    showAdvancedFilters || hasActiveAdvancedFilters
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Filters</span>
                  {hasActiveAdvancedFilters && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Filters */}
            {showAdvancedFilters && (
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={historyParams.startDate || ''}
                    onChange={(e) =>
                      setHistoryParams((prev) => ({ ...prev, startDate: e.target.value, page: 0 }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={historyParams.endDate || ''}
                    onChange={(e) =>
                      setHistoryParams((prev) => ({ ...prev, endDate: e.target.value, page: 0 }))
                    }
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Min Total (Rs.)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={historyParams.minTotal ?? ''}
                    onChange={(e) =>
                      setHistoryParams((prev) => ({
                        ...prev,
                        minTotal: e.target.value ? parseFloat(e.target.value) : undefined,
                        page: 0,
                      }))
                    }
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">Max Total (Rs.)</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={historyParams.maxTotal ?? ''}
                      onChange={(e) =>
                        setHistoryParams((prev) => ({
                          ...prev,
                          maxTotal: e.target.value ? parseFloat(e.target.value) : undefined,
                          page: 0,
                        }))
                      }
                      className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:border-indigo-500"
                    />
                  </div>
                  {hasActiveAdvancedFilters && (
                    <button
                      type="button"
                      onClick={handleResetHistoryFilters}
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

          {/* Clean Sales Table */}
          {isHistoryLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : !pagedSales || pagedSales.content.length === 0 ? (
            <EmptyState
              title="No sales found"
              description="Try adjusting your search or clear selected filters."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-medium">
                    <tr>
                      <th className="py-3 px-4">Invoice</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pagedSales.content.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {s.invoiceNumber.substring(0, 8)}...
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(s.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{s.saleItems?.length || 0}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          Rs. {Number(s.subTotal).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {Number(s.discount) > 0 ? `- Rs. ${Number(s.discount).toFixed(2)}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          Rs. {Number(s.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {s.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                              <CheckCircle className="h-3 w-3" />
                              COMPLETED
                            </span>
                          ) : s.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                              <Clock className="h-3 w-3" />
                              PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                              <XCircle className="h-3 w-3" />
                              CANCELLED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => handleResumeCheckout(s)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors"
                            >
                              Checkout
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResumeCheckout(s)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors"
                            >
                              <ReceiptText className="h-3 w-3 text-slate-400" />
                              Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination */}
              <Pagination
                currentPage={pagedSales.page}
                totalPages={pagedSales.totalPages}
                totalElements={pagedSales.totalElements}
                pageSize={pagedSales.size}
                onPageChange={(newPage) =>
                  setHistoryParams((prev) => ({ ...prev, page: newPage }))
                }
                onPageSizeChange={(newSize) =>
                  setHistoryParams((prev) => ({ ...prev, size: newSize, page: 0 }))
                }
              />
            </>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        sale={activeSaleForCheckout}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
