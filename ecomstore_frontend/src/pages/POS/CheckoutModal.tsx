import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { SaleResponse } from '../../types/sale';
import type { PaymentMethod, SubPaymentRequest, PaymentResponse } from '../../types/payment';
import { paymentService } from '../../api/paymentService';
import { getErrorMessage } from '../../api/client';
import {
  CreditCard,
  Banknote,
  Smartphone,
  QrCode,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Receipt,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleResponse | null;
  onPaymentSuccess: (payment: PaymentResponse, updatedSale: SaleResponse) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  sale,
  onPaymentSuccess,
}) => {
  const [subPayments, setSubPayments] = useState<SubPaymentRequest[]>([
    { paymentMethod: 'CASH', amount: 0, transactionId: '' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<PaymentResponse | null>(null);

  // Initialize or reset when sale changes
  useEffect(() => {
    if (sale) {
      setSubPayments([
        { paymentMethod: 'CASH', amount: Number(sale.total) || 0, transactionId: '' },
      ]);
      setCompletedPayment(null);
      setErrorMessage(null);
    }
  }, [sale]);

  if (!sale) return null;

  const totalAmount = Number(sale.total) || 0;
  const totalPaid = subPayments.reduce((sum, sp) => sum + (Number(sp.amount) || 0), 0);
  const remainingDue = Math.max(0, totalAmount - totalPaid);
  const changeToReturn = Math.max(0, totalPaid - totalAmount);
  const isFullyCovered = totalPaid >= totalAmount && totalAmount > 0;

  const handleAddSubPayment = () => {
    const defaultMethod: PaymentMethod = subPayments.some((sp) => sp.paymentMethod === 'CASH')
      ? 'ESEWA'
      : 'CASH';
    setSubPayments((prev) => [
      ...prev,
      {
        paymentMethod: defaultMethod,
        amount: remainingDue > 0 ? Number(remainingDue.toFixed(2)) : 0,
        transactionId: '',
      },
    ]);
  };

  const handleRemoveSubPayment = (index: number) => {
    setSubPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSubPayment = (
    index: number,
    field: keyof SubPaymentRequest,
    value: string | number
  ) => {
    setSubPayments((prev) =>
      prev.map((sp, i) => (i === index ? { ...sp, [field]: value } : sp))
    );
  };

  const handleProceedCheckout = async () => {
    setErrorMessage(null);

    if (totalPaid < totalAmount) {
      setErrorMessage(`Insufficient payment. Rs. ${remainingDue.toFixed(2)} still due.`);
      return;
    }

    for (const sp of subPayments) {
      if (!sp.amount || sp.amount <= 0) {
        setErrorMessage(`Please enter a valid amount for ${sp.paymentMethod}`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await paymentService.processPayment({
        saleId: sale.id,
        subPayments: subPayments.map((sp) => ({
          paymentMethod: sp.paymentMethod,
          amount: Number(sp.amount),
          transactionId: sp.transactionId?.trim() || undefined,
        })),
      });

      setCompletedPayment(response);
      const updatedSale: SaleResponse = {
        ...sale,
        status: 'COMPLETED',
      };
      onPaymentSuccess(response, updatedSale);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-3.5 w-3.5 text-emerald-600" />;
      case 'ESEWA':
        return <QrCode className="h-3.5 w-3.5 text-green-600" />;
      case 'KHALTI':
        return <Smartphone className="h-3.5 w-3.5 text-purple-600" />;
      case 'CARD':
        return <CreditCard className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <Banknote className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={completedPayment ? 'Sale Receipt' : 'Order Checkout'}
      subtitle={`Invoice #${sale.invoiceNumber.substring(0, 8)} • Order #${sale.id}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Clean Status Pill */}
        {completedPayment ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200/60 p-3 text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold">Payment Completed</span>
            </div>
            <span className="text-xs font-mono font-bold">
              Rs. {Number(completedPayment.paidAmount).toFixed(2)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/70 p-3 text-slate-700">
            <span className="text-xs font-medium text-slate-600">Total Amount Due</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              Rs. {totalAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Minimalist Bill Summary */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Items ({sale.saleItems.length})
            </span>
            <span>Line Total</span>
          </div>

          <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 px-3.5">
            {sale.saleItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.productName}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">
                    {item.quantity} × Rs. {Number(item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-100 text-right">
                  Rs. {Number(item.total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 px-3.5 py-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-slate-700 dark:text-slate-200">Rs. {Number(sale.subTotal).toFixed(2)}</span>
            </div>
            {Number(sale.tax) > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-mono text-slate-700 dark:text-slate-200">+ Rs. {Number(sale.tax).toFixed(2)}</span>
              </div>
            )}
            {Number(sale.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-mono">- Rs. {Number(sale.discount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Processing Section */}
        {!completedPayment ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Payment Tender
              </span>
              <button
                type="button"
                onClick={handleAddSubPayment}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add split method
              </button>
            </div>

            {/* Split Payments Rows */}
            <div className="space-y-2">
              {subPayments.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-2"
                >
                  {/* Method Dropdown */}
                  <div className="flex items-center gap-1.5 w-36">
                    {getMethodIcon(sp.paymentMethod)}
                    <select
                      value={sp.paymentMethod}
                      onChange={(e) =>
                        handleUpdateSubPayment(idx, 'paymentMethod', e.target.value as PaymentMethod)
                      }
                      className="w-full text-xs font-medium rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-slate-800 focus:border-indigo-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="ESEWA">eSewa</option>
                      <option value="KHALTI">Khalti</option>
                      <option value="CARD">Card</option>
                      <option value="MOBILE_BANKING">Banking</option>
                    </select>
                  </div>

                  {/* Amount Input */}
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={sp.amount || ''}
                      onChange={(e) =>
                        handleUpdateSubPayment(idx, 'amount', parseFloat(e.target.value) || 0)
                      }
                      placeholder="Amount"
                      className="w-full text-xs font-mono rounded-lg border border-slate-200 bg-white py-1 pl-7 pr-2 text-slate-800 focus:border-indigo-500"
                    />
                  </div>

                  {/* Ref ID for Digital Tender */}
                  {sp.paymentMethod !== 'CASH' && (
                    <input
                      type="text"
                      value={sp.transactionId || ''}
                      onChange={(e) =>
                        handleUpdateSubPayment(idx, 'transactionId', e.target.value)
                      }
                      placeholder="Txn ID"
                      className="w-28 text-xs rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-800 focus:border-indigo-500"
                    />
                  )}

                  {/* Delete Row */}
                  {subPayments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubPayment(idx)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Balance Calculation Card */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">
                Tendered:{' '}
                <span className="font-mono font-bold text-slate-800">
                  Rs. {totalPaid.toFixed(2)}
                </span>
              </span>
              <div>
                {remainingDue > 0 ? (
                  <span className="text-amber-600 font-semibold font-mono">
                    Due: Rs. {remainingDue.toFixed(2)}
                  </span>
                ) : changeToReturn > 0 ? (
                  <span className="text-emerald-600 font-semibold font-mono">
                    Change: Rs. {changeToReturn.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Exact Paid
                  </span>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close (Keep Pending)
              </button>
              <button
                type="button"
                onClick={handleProceedCheckout}
                disabled={!isFullyCovered || isProcessing}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-all ${
                  !isFullyCovered || isProcessing
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Receipt / Post-Payment Breakdown */
          <div className="space-y-3 pt-1">
            <div className="rounded-xl border border-slate-200/80 p-3 space-y-2 bg-white text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Payment Methods Used
              </span>
              <div className="divide-y divide-slate-100">
                {completedPayment.subPayments.map((sub, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 items-center">
                    <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                      {getMethodIcon(sub.paymentMethod)}
                      {sub.paymentMethod}
                      {sub.transactionId && (
                        <span className="text-[10px] font-mono text-slate-400">
                          (Ref: {sub.transactionId})
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      Rs. {Number(sub.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
