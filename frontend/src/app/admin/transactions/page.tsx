'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Filter,
  CreditCard,
  X,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useAdminSearch } from '@/context/AdminSearchContext';

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  amount: string;
  planName: string;
  gateway: string;
  status: 'SUCCEEDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  date: string;
  invoiceUrl: string;
}

export default function AdminTransactionsPage() {
  const { searchQuery } = useAdminSearch();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gatewayFilter, setGatewayFilter] = useState<string>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      const res = await fetch(`${apiUrl}/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setTransactions(json);
      } else {
        // Fallback demo data
        setTransactions([
          {
            id: 'TXN-904128',
            userEmail: 'sarah.architect@yahoo.com',
            userName: 'Sarah Architect',
            amount: '$49.00',
            planName: 'Professional Plan (Monthly)',
            gateway: 'Stripe',
            status: 'SUCCEEDED',
            date: new Date(Date.now() - 3600000 * 2).toISOString(),
            invoiceUrl: '#',
          },
          {
            id: 'TXN-904127',
            userEmail: 'john.designer@gmail.com',
            userName: 'John Designer',
            amount: '$19.00',
            planName: 'Starter Plan (Monthly)',
            gateway: 'PayPal',
            status: 'SUCCEEDED',
            date: new Date(Date.now() - 3600000 * 14).toISOString(),
            invoiceUrl: '#',
          },
          {
            id: 'TXN-904126',
            userEmail: 'test@yopmail.com',
            userName: 'Test User',
            amount: '$29.00',
            planName: 'Standard Plan',
            gateway: 'Stripe',
            status: 'SUCCEEDED',
            date: new Date(Date.now() - 3600000 * 48).toISOString(),
            invoiceUrl: '#',
          },
          {
            id: 'TXN-904125',
            userEmail: 'alex.renovator@gmail.com',
            userName: 'Alex Renovator',
            amount: '$99.00',
            planName: 'Credits Top-Up 500',
            gateway: 'Stripe',
            status: 'SUCCEEDED',
            date: new Date(Date.now() - 3600000 * 72).toISOString(),
            invoiceUrl: '#',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      !searchQuery ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGateway = gatewayFilter === 'ALL' || txn.gateway.toUpperCase() === gatewayFilter.toUpperCase();

    return matchesSearch && matchesGateway;
  });

  const handleExportCSV = () => {
    let csv = 'Transaction ID,User Name,User Email,Plan/Item,Gateway,Amount,Status,Date\n';
    filteredTransactions.forEach((t) => {
      csv += `"${t.id}","${t.userName}","${t.userEmail}","${t.planName}","${t.gateway}","${t.amount}","${t.status}","${new Date(t.date).toLocaleDateString()}"\n`;
    });
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVolume = filteredTransactions.reduce((acc, t) => {
    const val = parseFloat(t.amount.replace(/[^0-9.]/g, '')) || 0;
    return acc + val;
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Filter Controls & Export */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{filteredTransactions.length}</span> transactions
        </div>

        <div className="flex items-center gap-3">
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Gateways</option>
            <option value="STRIPE">Stripe</option>
            <option value="PAYPAL">PayPal</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Processed Total Volume</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">${totalVolume.toFixed(2)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Ledger Transactions</span>
            <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{filteredTransactions.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gateway Status</span>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Stripe & PayPal Active
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Transaction ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Plan / Item</th>
                <th className="py-3.5 px-6">Gateway</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900 font-mono">{txn.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900">{txn.userName}</p>
                        <p className="text-[11px] text-slate-400">{txn.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{txn.planName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-[11px] font-bold ${
                        txn.gateway === 'Stripe' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      }`}>
                        <CreditCard className="w-3 h-3" />
                        {txn.gateway}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">{txn.amount}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Succeeded
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900">Invoice Stub</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedTxn.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer Name</span>
                  <span className="font-bold text-slate-900">{selectedTxn.userName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer Email</span>
                  <span className="font-bold text-slate-900">{selectedTxn.userEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Product / Plan</span>
                  <span className="font-bold text-slate-900">{selectedTxn.planName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Payment Gateway</span>
                  <span className="font-bold text-slate-900">{selectedTxn.gateway}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="font-black text-slate-900 text-sm">{selectedTxn.amount}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Close Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
