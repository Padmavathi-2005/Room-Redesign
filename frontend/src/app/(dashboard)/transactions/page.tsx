'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Zap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Copy,
  Download,
  ClipboardCheck,
  Printer,
  X,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  Search,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { CreditTokenIcon } from '@/components/ui';
import Modal from '@/components/ui/Modal';

interface CreditLot {
  lotId: string;
  source: string;
  initialCredits: number;
  remainingCredits: number;
  startDate: string;
  expiryDate: string;
}

interface SubscriptionData {
  plan: string;
  credits: number;
  subscriptionStatus: string;
  subscriptionPeriodEnd: string | null;
  subscriptionPeriodStart?: string | null;
  daysRemaining?: number;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  creditLots?: CreditLot[];
}

interface DatabaseInvoice {
  _id: string;
  stripeInvoiceId: string;
  amountPaid: number;
  currency: string;
  status: string;
  planCode: string;
  billingCycle: string;
  paymentMethod: string;
  invoicePdfUrl: string;
  paidAt: string;
}

interface CreditLedgerEntry {
  _id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

function getLedgerTypeBadge(type: string, description?: string, t?: any) {
  const b = t?.billing?.ledgerTable?.badges;
  const upper = (type || '').toUpperCase();
  if (upper === 'PROMOTION_GRANT' || upper === 'OFFER_GRANT') {
    return {
      label: b?.specialOffer || 'Special Offer 🎁',
      className: 'bg-amber-500/15 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-black',
    };
  }
  switch (upper) {
    case 'GENERATION_DEDUCTION':
    case 'GENERATION':
      return {
        label: b?.generation || 'Generation',
        className: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
      };
    case 'DEDUCTION':
      return {
        label: b?.deduction || 'Deduction',
        className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
      };
    case 'GRANT':
    case 'CREDIT_ADDITION':
      return {
        label: b?.creditAddition || 'Credit Addition',
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold',
      };
    case 'REFUND':
    case 'GENERATION_REFUND':
      return {
        label: b?.autoRefund || 'Auto Refund',
        className: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
      };
    case 'ADMIN_GRANT':
    case 'ADMIN_ADJUSTMENT':
      return {
        label: b?.creditAddition || 'Credit Addition',
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold',
      };
    case 'ADMIN_DEDUCTION':
      return {
        label: b?.adminAdjustment || 'Admin Adjustment',
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
      };
    case 'EXPIRE':
    case 'LOT_EXPIRED':
      return {
        label: b?.expired || 'Expired',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      };
    default:
      return {
        label: upper.replace(/_/g, ' '),
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      };
  }
}

function formatLedgerDescription(desc?: string) {
  if (!desc) return 'Credit transaction';

  return desc
    .replace(/^AI Generation Deducted:\s*/i, 'AI Generation: ')
    .replace(/interior-design/g, 'Interior Design')
    .replace(/3d-floor-plan/g, '3D Floor Plan')
    .replace(/sketch-to-render/g, 'Sketch to Render')
    .replace(/8k-render/g, '8K Render');
}

function LotCountdownRow({ lot, t }: { lot: CreditLot; t?: any }) {
  const [timerText, setTimerText] = useState<string>('--:--:--');
  const [statusStyle, setStatusStyle] = useState<string>('bg-slate-100 text-slate-600');

  useEffect(() => {
    if (!lot.expiryDate) {
      setTimerText(t?.billing?.batchesTable?.noExpiry || 'No Expiry');
      setStatusStyle('bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400');
      return;
    }

    const updateTimer = () => {
      const exp = new Date(lot.expiryDate!).getTime();
      const diff = exp - Date.now();

      if (isNaN(exp)) {
        setTimerText(lot.expiryDate || 'N/A');
        setStatusStyle('bg-slate-100 text-slate-600');
        return;
      }

      if (diff <= 0) {
        setTimerText(t?.billing?.batchesTable?.expired || 'Expired');
        setStatusStyle('bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      if (diff <= 3600000) {
        setTimerText(`⏳ ${formattedTime}`);
        setStatusStyle('bg-rose-500 text-white font-black animate-pulse border border-rose-400 shadow-xs');
      } else if (diff <= 86400000) {
        setTimerText(`⏳ ${formattedTime}`);
        setStatusStyle('bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-200');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const daysLabel = (t?.billing?.cards?.daysRemaining || '{count} days remaining').replace('{count}', String(days));
        setTimerText(`${daysLabel} (${formattedTime})`);
        setStatusStyle('bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lot.expiryDate, t]);

  const formattedStart = lot.startDate ? new Date(lot.startDate).toLocaleString() : (t?.billing?.cards?.notApplicable || 'N/A');
  const formattedExpiry = lot.expiryDate ? new Date(lot.expiryDate).toLocaleString() : (t?.billing?.batchesTable?.noExpiry || 'No Expiry');

  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">
        {lot.source === lot.source.toUpperCase()
          ? lot.source
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase())
              .replace('(monthly)', '(Monthly)')
              .replace('(annual)', '(Annual)')
          : lot.source}
      </td>
      <td className="py-3.5 px-4 text-center font-mono">{lot.initialCredits}</td>
      <td className="py-3.5 px-4 text-center font-mono text-amber-600 font-bold">{lot.remainingCredits}</td>
      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
        <div><span className="text-[10px] text-slate-400 uppercase">Starts:</span> {formattedStart}</div>
        <div><span className="text-[10px] text-slate-400 uppercase">Expires:</span> <strong className="text-slate-800 dark:text-slate-200">{formattedExpiry}</strong></div>
      </td>
      <td className="py-3.5 px-4 text-right">
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide inline-flex items-center gap-1 ${statusStyle}`}>
          {timerText}
        </span>
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { t } = useTranslation();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<DatabaseInvoice[]>([]);
  const [creditLedger, setCreditLedger] = useState<CreditLedgerEntry[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<DatabaseInvoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // The 2 clear types: 'payments' (Real Currency) and 'credits' (Credits)
  const [transactionType, setTransactionType] = useState<'payments' | 'credits'>('payments');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    const initialize = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUserStr = localStorage.getItem('user');

        if (storedUserStr) {
          try {
            setCurrentUser(JSON.parse(storedUserStr));
          } catch (e) {}
        }

        if (storedToken) {
          setToken(storedToken);

          try {
            const [statusRes, invRes, ledgerRes] = await Promise.all([
              fetch(`${API_BASE}/subscription/status`, {
                headers: { Authorization: `Bearer ${storedToken}` },
              }),
              fetch(`${API_BASE}/subscription/invoices`, {
                headers: { Authorization: `Bearer ${storedToken}` },
              }),
              fetch(`${API_BASE}/subscription/credit-ledger`, {
                headers: { Authorization: `Bearer ${storedToken}` },
              }),
            ]);

            const statusData = await statusRes.json();
            if (statusData && statusData.success) {
              setSubscription(statusData.data);
            }

            const invData = await invRes.json();
            if (invData && invData.success) {
              setInvoices(invData.data || []);
            }

            const ledgerData = await ledgerRes.json();
            if (ledgerData && ledgerData.success) {
              setCreditLedger(ledgerData.data || []);
            }
          } catch (err) {
            console.error('Failed to load transaction data:', err);
          }
        }
        setLoading(false);
      }
    };
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider font-heading">
          {t?.billing?.loadingData || 'Loading Transactions...'}
        </span>
      </div>
    );
  }

  const creditsRemaining = subscription?.credits ?? currentUser?.credits ?? 0;

  // Filter invoices by search query
  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.stripeInvoiceId.toLowerCase().includes(q) ||
      inv.planCode.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q)
    );
  });

  // Filter ledger entries by search query
  const filteredLedger = creditLedger.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.type.toLowerCase().includes(q) ||
      (entry.description && entry.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 text-left font-sans animate-in fade-in duration-300">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider border border-primary/20 mb-2">
            <Receipt className="w-3 h-3 text-primary" />
            {t?.transactionsPage?.title || 'Transactions'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            {t?.transactionsPage?.title || 'Transactions'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t?.transactionsPage?.subtitle || 'Track your real currency purchases, Stripe invoices, and AI credit usage history.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/billing"
            className="px-4 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all font-heading"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>{t?.billing?.upgradePlan || 'Upgrade Plan'}</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
            <CreditTokenIcon size="xs" />
            <span>{creditsRemaining} Credits</span>
          </div>
        </div>
      </div>

      {/* TWO DISTINCT TRANSACTION TYPE TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* TYPE 1: REAL CURRENCY (PAYMENTS & INVOICES) */}
          <button
            type="button"
            onClick={() => setTransactionType('payments')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-heading flex items-center gap-2 ${
              transactionType === 'payments'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t?.transactionsPage?.tabs?.realCurrency || 'Payments & Invoices'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${transactionType === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {invoices.length}
            </span>
          </button>

          {/* TYPE 2: CREDITS (CREDIT USAGE) */}
          <button
            type="button"
            onClick={() => setTransactionType('credits')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer font-heading flex items-center gap-2 ${
              transactionType === 'credits'
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditTokenIcon size="xs" />
            <span>{t?.transactionsPage?.tabs?.credits || 'Credit Usage'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${transactionType === 'credits' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {creditLedger.length}
            </span>
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t?.common?.search || 'Search...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* SECTION 1: PAYMENTS & INVOICES (REAL CURRENCY) */}
      {transactionType === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>{t?.billing?.invoicesTable?.title || 'Billing Invoices & Purchase Receipts'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t?.transactionsPage?.realCurrencyTagline || 'Real currency payment transactions & verified Stripe invoices'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                {(t?.transactionsPage?.invoicesCount || '{count} Verified Invoices').replace('{count}', String(filteredInvoices.length))}
              </span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                    <th className="py-3.5 px-4">{t?.billing?.invoicesTable?.colId || 'Invoice ID'}</th>
                    <th className="py-3.5 px-4">{t?.billing?.invoicesTable?.colDate || 'Paid Date'}</th>
                    <th className="py-3.5 px-4">{t?.billing?.invoicesTable?.colPlan || 'Plan / Interval'}</th>
                    <th className="py-3.5 px-4">{t?.billing?.invoicesTable?.colAmount || 'Amount'}</th>
                    <th className="py-3.5 px-4">{t?.billing?.invoicesTable?.colStatus || 'Status'}</th>
                    <th className="py-3.5 px-4 text-right">{t?.billing?.invoicesTable?.colActions || 'Receipt / Invoice'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                        <td className="py-4 px-4 max-w-[180px]">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]"
                              title={inv.stripeInvoiceId}
                            >
                              {inv.stripeInvoiceId.slice(0, 18)}…
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(inv.stripeInvoiceId)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary cursor-pointer"
                              title={t?.billing?.invoicesTable?.copyTooltip || 'Copy full Invoice ID'}
                            >
                              {copiedId === inv.stripeInvoiceId ? (
                                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {new Date(inv.paidAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-extrabold capitalize text-slate-900 dark:text-slate-100">
                          {inv.planCode} ({inv.billingCycle})
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 dark:text-slate-100">
                          {formatPrice(inv.amountPaid)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all cursor-pointer"
                              title="View RoomAI Official Branded Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{t?.billing?.invoicesTable?.viewInvoice || 'View Invoice'}</span>
                            </button>

                            {inv.invoicePdfUrl && (
                              <a
                                href={inv.invoicePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
                                title={t?.billing?.invoicesTable?.downloadTooltip || 'Download Stripe PDF Receipt'}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t?.billing?.invoicesTable?.downloadPdf || 'Download PDF'}</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        {t?.billing?.invoicesTable?.noInvoices || 'No verified Stripe database invoices recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CREDIT USAGE (CREDITS) */}
      {transactionType === 'credits' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ACTIVE CREDIT BATCHES & EXPIRY PERIODS */}
          {subscription?.creditLots && subscription.creditLots.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
                    <CreditTokenIcon size="sm" />
                    <span>{t?.billing?.batchesTable?.title || 'Active Credit Batches & Expiry Periods'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t?.billing?.batchesTable?.subtitle || 'Persisted credit lots, granted amounts, remaining balance, and live countdowns.'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                  {(t?.transactionsPage?.batchesCount || '{count} Active Batches').replace('{count}', String(subscription.creditLots.length))}
                </span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                      <th className="py-3 px-4">{t?.billing?.batchesTable?.colSource || 'Source / Lot ID'}</th>
                      <th className="py-3 px-4 text-center">{t?.billing?.batchesTable?.colGranted || 'Initial Granted'}</th>
                      <th className="py-3 px-4 text-center">{t?.billing?.batchesTable?.colRemaining || 'Remaining Balance'}</th>
                      <th className="py-3 px-4">{t?.billing?.batchesTable?.colExpiry || 'Validity Expiry (Date & Time)'}</th>
                      <th className="py-3 px-4 text-right">{t?.billing?.batchesTable?.colCountdown || 'Live Countdown'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                    {subscription.creditLots
                      .filter((lot) => !['PLAN $19', 'BONUS', 'REFUND'].includes(lot.source))
                      .map((lot, idx) => (
                        <LotCountdownRow key={lot.lotId || idx} lot={lot} t={t} />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CREDIT USAGE LEDGER & TRANSACTION AUDIT */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{t?.billing?.ledgerTable?.title || 'Credit Usage Ledger & Transaction Audit'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t?.transactionsPage?.creditsTagline || 'Server-side audit log of generation deductions, bonuses, and active credit lots'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px] font-extrabold uppercase tracking-wider w-fit">
                {(t?.transactionsPage?.creditsCount || '{count} Ledger Entries').replace('{count}', String(filteredLedger.length))}
              </span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/70 dark:bg-slate-800/50">
                    <th className="py-3 px-4">{t?.billing?.ledgerTable?.colDate || 'Date & Time'}</th>
                    <th className="py-3 px-4">{t?.billing?.ledgerTable?.colType || 'Type'}</th>
                    <th className="py-3 px-4">{t?.billing?.ledgerTable?.colDescription || 'Description'}</th>
                    <th className="py-3 px-4 text-center">{t?.billing?.ledgerTable?.colAmount || 'Amount'}</th>
                    <th className="py-3 px-4 text-right">{t?.billing?.ledgerTable?.colBalanceAfter || 'Balance After'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.map((log) => {
                      const badge = getLedgerTypeBadge(log.type, log.description, t);
                      const cleanDesc = formatLedgerDescription(log.description);
                      return (
                        <tr key={log._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide inline-flex items-center ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">{cleanDesc}</td>
                          <td className={`py-3.5 px-4 text-center font-mono font-bold text-xs ${log.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {log.amount > 0 ? `+${log.amount}` : log.amount}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                            {log.balanceAfter}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        {t?.billing?.ledgerTable?.noEntries || 'No audit ledger transactions recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ROOMAI OFFICIAL BRANDED INVOICE MODAL */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="3xl"
        showCloseButton={false}
      >
        {selectedInvoice && (
          <div className="space-y-6 font-sans text-left relative">
            {/* Invoice Document Header with Close Button */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-md overflow-hidden shrink-0">
                    {settings?.logo ? (
                      <img src={settings.logo} alt={settings.applicationName || 'Site Logo'} className="w-full h-full object-contain p-1" />
                    ) : (
                      (settings?.applicationName || 'RoomAI').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {settings?.applicationName || 'RoomAI Inc.'}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {t?.billing?.invoiceModal?.platformSubtitle || 'AI Interior Architectural & Room Redesign Platform'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-mono pt-1">
                  {settings?.supportEmail || 'support@roomai.com'} • {settings?.siteUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://roomai.com')}
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-right space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-black text-xs uppercase tracking-wider border border-emerald-300/40 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {t?.billing?.invoiceModal?.paidBadge || 'PAID INVOICE'}
                  </span>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                    {(t?.billing?.invoiceModal?.date || 'Date: {date}').replace('{date}', new Date(selectedInvoice.paidAt).toLocaleDateString())}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
                  aria-label="Close invoice"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Customer & Invoice Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t?.billing?.invoiceModal?.billedTo || 'Billed To Customer'}
                </span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {currentUser?.name || currentUser?.email || t?.billing?.invoiceModal?.valuedCustomer || 'Valued Customer'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser?.email || 'user@example.com'}</p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t?.billing?.invoiceModal?.invoiceRef || 'Invoice Reference ID'}
                </span>
                <p className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 break-all">
                  {selectedInvoice.stripeInvoiceId}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {(t?.billing?.invoiceModal?.paymentMethod || 'Payment Method: {method}').replace('{method}', selectedInvoice.paymentMethod || t?.billing?.invoiceModal?.stripeCheckout || 'Stripe Checkout')}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">{t?.billing?.invoiceModal?.itemDesc || 'Item Description'}</th>
                    <th className="py-3 px-4">{t?.billing?.invoiceModal?.billingCycle || 'Billing Cycle'}</th>
                    <th className="py-3 px-4 text-center">{t?.billing?.invoiceModal?.qty || 'Qty'}</th>
                    <th className="py-3 px-4 text-right">{t?.billing?.invoiceModal?.amount || 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white capitalize">
                      {(t?.billing?.invoiceModal?.planOrPack || '{plan} Plan / Credit Pack').replace('{plan}', selectedInvoice.planCode.replace('-', ' '))}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-400">
                      {selectedInvoice.billingCycle}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      1
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                      {formatPrice(selectedInvoice.amountPaid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Amount Box */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-64 space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>{t?.billing?.invoiceModal?.subtotal || 'Subtotal:'}</span>
                  <span>{formatPrice(selectedInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>{t?.billing?.invoiceModal?.tax || 'Tax (0%):'}</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>{t?.billing?.invoiceModal?.totalPaid || 'Total Paid:'}</span>
                  <span className="text-primary font-mono">{formatPrice(selectedInvoice.amountPaid)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer font-sans"
              >
                <Printer className="w-4 h-4" />
                <span>{t?.billing?.invoiceModal?.printPdf || 'Print / Save PDF'}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {selectedInvoice.invoicePdfUrl && (
                  <a
                    href={selectedInvoice.invoicePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t?.billing?.invoiceModal?.stripePdf || 'Stripe PDF'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer font-sans"
                >
                  {t?.billing?.invoiceModal?.close || 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
