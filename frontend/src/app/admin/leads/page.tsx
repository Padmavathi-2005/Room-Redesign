'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Crown,
  Zap,
  UserPlus,
  Users,
  ExternalLink,
  X,
  Filter,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { CreditTokenIcon } from '@/components/ui';
import CustomSelect from '@/components/ui/CustomSelect';
import { useAdminSearch } from '@/context/AdminSearchContext';

export interface DemoLeadItem {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  company?: string;
  requestedUse?: string;
  estimatedRenders?: string;
  notes?: string;
  status: 'PENDING' | 'CONVERTED' | 'CONTACTED';
  createdAt: string;
  convertedPlan?: string;
  convertedCredits?: number;
}

export default function AdminLeadsPage() {
  const { searchQuery } = useAdminSearch();
  const [leads, setLeads] = useState<DemoLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Table Filter States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONVERTED'>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');

  // Conversion Modal State - Defaults to Free Tier
  const [selectedLead, setSelectedLead] = useState<DemoLeadItem | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('FREE');
  const [creditsToGrant, setCreditsToGrant] = useState<number>(0);
  const [enableProfileHighlight, setEnableProfileHighlight] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getMockLeads = (): DemoLeadItem[] => [
    {
      id: 'lead_1',
      name: 'Sarah Architect',
      email: 'sarah.architect@yahoo.com',
      phone: '+1 (555) 234-5678',
      companyName: 'Studio Arch Design',
      estimatedRenders: '200-500 renders/mo',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'lead_2',
      name: 'Marcus Vance',
      email: 'marcus@vancedesign.com',
      phone: '+1 (555) 876-5432',
      companyName: 'Vance Interiors Group',
      estimatedRenders: '500+ renders/mo',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'lead_3',
      name: 'Elena Rostova',
      email: 'elena@rostovabuild.com',
      phone: '+1 (555) 432-1098',
      companyName: 'Rostova Developments',
      estimatedRenders: '50-200 renders/mo',
      status: 'CONVERTED',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      convertedPlan: 'ENTERPRISE',
      convertedCredits: 1000,
    },
  ];

  const loadLeads = () => {
    setIsLoading(true);
    let demoLeadsList: DemoLeadItem[] = [];

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_leads');
      if (stored) {
        try {
          demoLeadsList = JSON.parse(stored);
        } catch {
          demoLeadsList = getMockLeads();
        }
      } else {
        demoLeadsList = getMockLeads();
        localStorage.setItem('demo_leads', JSON.stringify(demoLeadsList));
      }
    }

    setLeads(demoLeadsList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeads();
    const handleUpdate = () => loadLeads();
    window.addEventListener('demo-lead-submitted', handleUpdate);
    return () => window.removeEventListener('demo-lead-submitted', handleUpdate);
  }, []);

  const handleOpenConvertModal = (lead: DemoLeadItem) => {
    setSelectedLead(lead);
    setSelectedPlan('FREE');
    setCreditsToGrant(0);
    setEnableProfileHighlight(false);
    setIsConvertModalOpen(true);
  };

  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
    if (plan === 'FREE') {
      setCreditsToGrant(0);
      setEnableProfileHighlight(false);
    } else if (plan === 'STARTER') {
      setCreditsToGrant(100);
      setEnableProfileHighlight(false);
    } else if (plan === 'PRO') {
      setCreditsToGrant(300);
      setEnableProfileHighlight(true);
    } else if (plan === 'ENTERPRISE') {
      setCreditsToGrant(1000);
      setEnableProfileHighlight(true);
    } else if (plan === 'CUSTOM_DEMO') {
      setCreditsToGrant(500);
      setEnableProfileHighlight(true);
    }
  };

  const handleConfirmConversion = async () => {
    if (!selectedLead) return;
    setIsSubmitting(true);

    if (typeof window !== 'undefined') {
      const updatedLeads = leads.map((item) =>
        item.id === selectedLead.id
          ? {
              ...item,
              status: 'CONVERTED' as const,
              convertedPlan: selectedPlan,
              convertedCredits: creditsToGrant,
            }
          : item
      );
      setLeads(updatedLeads);
      localStorage.setItem('demo_leads', JSON.stringify(updatedLeads));

      const userObj = {
        _id: selectedLead.id,
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        role: 'user',
        plan: selectedPlan,
        credits: creditsToGrant,
        isProfileHighlightEnabled: enableProfileHighlight,
        paymentStatus: 'ADMIN_GRANTED_DEMO',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('user-updated'));
      window.dispatchEvent(new Event('user-credits-updated'));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsConvertModalOpen(false);
      setSuccessMessage(
        `Lead updated successfully! ${selectedLead.name} (${selectedLead.email}) assigned ${selectedPlan} Plan with ${creditsToGrant} credits.`
      );
    }, 400);
  };

  const columns: Column<DemoLeadItem>[] = [
    {
      key: 'name',
      header: 'Lead Name & Contact',
      sortable: true,
      accessor: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0 font-heading">
            {lead.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">{lead.name}</span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" /> {lead.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      accessor: (lead) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Phone className="w-3.5 h-3.5 text-purple-600" />
          <span>{lead.phone}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company & Volume',
      accessor: (lead) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 font-heading">
            <Building2 className="w-3 h-3 text-purple-600" /> {lead.companyName || 'N/A'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">{lead.estimatedRenders || 'Standard'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Onboarding Status',
      sortable: true,
      accessor: (lead) => (
        <div>
          {lead.status === 'CONVERTED' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Converted ({lead.convertedPlan || 'FREE'} -</span>
              <CreditTokenIcon size="xs" />
              <span>{lead.convertedCredits})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3 h-3 text-amber-600" /> Pending Review
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Admin Actions',
      accessor: (lead) => (
        <div className="flex items-center gap-2">
          {lead.status !== 'CONVERTED' ? (
            <button
              onClick={() => handleOpenConvertModal(lead)}
              className="px-3 py-1.5 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Grant Plan & Credits</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Account Active
              </span>
              <Link
                href={`/admin/users?search=${encodeURIComponent(lead.email)}`}
                className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                title="View in Users Console"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Users Console</span>
              </Link>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Memoized Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
        return false;
      }
      // 2. Plan Filter
      if (planFilter !== 'ALL') {
        const plan = (lead.convertedPlan || 'FREE').toUpperCase();
        if (planFilter === 'FREE' && plan !== 'FREE') return false;
        if (planFilter === 'STARTER' && !plan.includes('STARTER')) return false;
        if (planFilter === 'PRO' && !plan.includes('PRO')) return false;
        if (planFilter === 'ENTERPRISE' && !plan.includes('ENTERPRISE') && !plan.includes('AGENCY')) return false;
      }

      if (searchQuery && searchQuery.trim()) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const formattedDate = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '';
        const fullSearchableText = [
          lead._id,
          lead.id,
          lead.name,
          lead.email,
          lead.phone,
          lead.company,
          lead.status,
          lead.requestedUse,
          lead.convertedPlan,
          formattedDate,
        ].filter(Boolean).join(' ').toLowerCase();

        return searchTerms.every((term) => fullSearchableText.includes(term));
      }

      return true;
    });
  }, [leads, statusFilter, planFilter, searchQuery]);

  // Filter Bar Component placed on top left toolbar of DataTable
  const filterToolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status Filter Pills */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-[10px] border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-bold">
          <Filter className="w-3.5 h-3.5 text-purple-600" />
          <span>Status:</span>
        </div>
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
        >
          All ({leads.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
        >
          Pending Review ({leads.filter((l) => l.status === 'PENDING').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('CONVERTED')}
          className={`px-2.5 py-1 text-xs font-bold rounded-[8px] transition-all cursor-pointer ${
            statusFilter === 'CONVERTED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700'
          }`}
        >
          Converted ({leads.filter((l) => l.status === 'CONVERTED').length})
        </button>
      </div>

      {/* Plan Filter Dropdown with Custom Design */}
      <CustomSelect
        value={planFilter}
        onChange={(val) => setPlanFilter(val)}
        labelPrefix="Plan:"
        size="sm"
        options={[
          { value: 'ALL', label: 'All Subscription Plans' },
          { value: 'FREE', label: 'Free Tier' },
          { value: 'STARTER', label: 'Starter Pro ($19)' },
          { value: 'PRO', label: 'Pro Studio ($39)' },
          { value: 'ENTERPRISE', label: 'Agency Master ($89)' },
        ]}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DataTable Component with top header search integration & filter toolbar */}
      <DataTable
        data={filteredLeads}
        columns={columns}
        isLoading={isLoading}
        actions={filterToolbar}
        externalSearchQuery={searchQuery}
        hideSearchInput={true}
        emptyMessage="No demo request leads found matching selected filter criteria."
      />

      {/* ADMIN CONVERT & PROVISION MODAL */}
      <AnimatePresence>
        {isConvertModalOpen && selectedLead && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[10px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-4"
            >
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[10px] font-bold mb-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" /> Admin Account Provisioning
                </span>
                <h3 className="text-lg font-extrabold font-heading text-slate-900 dark:text-white">
                  Assign Plan & Credit Top-Up
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Grant plans or add credit top-ups for <strong className="text-slate-900 dark:text-white">{selectedLead.name}</strong> ({selectedLead.email}).
                </p>
              </div>

              {/* Lead Summary Info Box */}
              <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <p className="text-slate-500 font-medium">Contact Phone: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.phone}</span></p>
                <p className="text-slate-500 font-medium">Company: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.companyName || 'N/A'}</span> ({selectedLead.estimatedRenders})</p>
              </div>

              {/* Plan Selection Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Subscription Plan for User:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'FREE', label: 'Free Tier', price: '$0/mo', credits: 0, desc: 'Basic Access & Trial', highlight: false },
                    { id: 'STARTER', label: 'Starter Pro', price: '$19/mo', credits: 40, desc: 'Standard Renders & 8K', highlight: false },
                    { id: 'PRO', label: 'Pro Studio', price: '$39/mo', credits: 100, desc: 'Priority Queue & 4K', highlight: true },
                    { id: 'ENTERPRISE', label: 'Agency Master', price: '$89/mo', credits: 1000, desc: 'Full Agency Access', highlight: true },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanChange(plan.id)}
                      className={`p-3 rounded-[10px] border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedPlan === plan.id
                          ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100 ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-heading">
                          <span className="font-extrabold text-xs flex items-center gap-1 font-heading">
                            <span>{plan.label}</span>
                            {plan.highlight && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                          </span>
                          <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded-[6px]">{plan.price}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{plan.desc}</p>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-400 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                        <CreditTokenIcon size="xs" />
                        <span>+{plan.credits} Credits Added</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Credit Override */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Add Credit Top-Up / Balance:
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3">
                    <CreditTokenIcon size="xs" />
                  </div>
                  <input
                    type="number"
                    value={creditsToGrant}
                    onChange={(e) => setCreditsToGrant(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Profile Highlight Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Enable Profile Highlight (Crown Badge)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableProfileHighlight}
                  onChange={(e) => setEnableProfileHighlight(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Payment Method Badge */}
              <div className="p-2.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment Status
                </span>
                <span className="px-2 py-0.5 rounded-[6px] bg-emerald-200/80 dark:bg-emerald-900 text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-100">
                  ADMIN GRANTED (0 COST)
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="w-1/2 py-2 rounded-[10px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmConversion}
                  className="w-1/2 py-2 rounded-[10px] bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Grant Plan & Credits'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
