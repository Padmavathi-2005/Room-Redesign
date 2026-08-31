'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Terminal,
  X,
  Code,
  RefreshCw,
} from 'lucide-react';

interface AuditLog {
  id: string;
  service: string;
  event: string;
  status: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  details: Record<string, any>;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || localStorage.getItem('token') : '';

      const res = await fetch(`${apiUrl}/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setLogs(json);
      } else {
        // Fallback demo data
        setLogs([
          {
            id: 'LOG-8801',
            service: 'Primary AI Engine',
            event: 'POST /api/v1/rooms/generate',
            status: 200,
            level: 'INFO',
            message: 'Successfully generated room render in 3.4s',
            timestamp: new Date().toISOString(),
            details: { model: 'manus-v2-hq', resolution: '2048x2048', userId: 'user_001' },
          },
          {
            id: 'LOG-8802',
            service: 'Auth Guard',
            event: 'POST /api/v1/auth/admin-login',
            status: 200,
            level: 'INFO',
            message: 'Admin admin@gmail.com logged in successfully',
            timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
            details: { ip: '127.0.0.1', role: 'main_admin' },
          },
          {
            id: 'LOG-8803',
            service: 'Payment Service',
            event: 'POST /api/v1/payments/checkout',
            status: 200,
            level: 'INFO',
            message: 'Stripe Checkout Session created for Professional Tier',
            timestamp: new Date(Date.now() - 60000 * 45).toISOString(),
            details: { plan: 'PROFESSIONAL', amount: 4900 },
          },
          {
            id: 'LOG-8804',
            service: 'RoomWhiz AI',
            event: 'POST /api/v1/ai-tools/upscale',
            status: 429,
            level: 'WARN',
            message: 'Rate limit warning: 85% capacity reached on worker pool',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: { activeWorkers: 17, maxWorkers: 20 },
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200/80 shadow-xs backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Audit & System API Logs</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time execution logs, security events, and AI engine response metrics.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter service, event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full sm:w-36 px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Viewer Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>live_system_log_stream.log</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500">{filteredLogs.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50">
                <th className="py-3 px-5">Level</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Service</th>
                <th className="py-3 px-5">Event</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Message</th>
                <th className="py-3 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No log events match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.level === 'INFO'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-5 font-bold text-indigo-400">{log.service}</td>
                    <td className="py-3 px-5 text-slate-300">{log.event}</td>
                    <td className="py-3 px-5">
                      <span className={log.status >= 400 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-300 truncate max-w-xs">{log.message}</td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-slate-200 rounded-2xl p-6 max-w-lg w-full border border-slate-800 shadow-2xl relative space-y-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-slate-100">{selectedLog.id} Payload Inspection</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto space-y-2 text-[11px]">
                <p><span className="text-slate-500">Service:</span> <span className="text-indigo-400">{selectedLog.service}</span></p>
                <p><span className="text-slate-500">Endpoint:</span> <span className="text-emerald-400">{selectedLog.event}</span></p>
                <p><span className="text-slate-500">Timestamp:</span> <span className="text-slate-300">{selectedLog.timestamp}</span></p>
                <p><span className="text-slate-500">Payload Details:</span></p>
                <pre className="text-emerald-300 bg-slate-900 p-3 rounded-2xl overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
