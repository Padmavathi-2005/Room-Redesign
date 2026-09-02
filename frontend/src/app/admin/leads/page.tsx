'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  Layers,
  Crown,
  Zap,
  ChevronRight,
  UserPlus,
  X,
  CreditCard,
} from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useAdminSearch } from '@/context/AdminSearchContext';

export interface DemoLeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
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
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Conversion Modal State
  const [selectedLead, setSelectedLead] = useState<DemoLeadItem | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('PRO');
  const [creditsToGrant, setCreditsToGrant] = useState<number>(300);
  const [enableProfileHighlight, setEnableProfileHighlight] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadLeads = () => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demo_leads');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLeads(parsed);
        } catch {
          setLeads(getMockLeads());
        }
      } else {
        const initialMock = getMockLeads();
        localStorage.setItem('demo_leads', JSON.stringify(initialMock));
        setLeads(initialMock);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadLeads();
    const handleUpdate = () => loadLeads();
    window.addEventListener('demo-lead-submitted', handleUpdate);
    return () => window.removeEventListener('demo-lead-submitted', handleUpdate);
  }, []);

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

  const handleOpenConvertModal = (lead: DemoLeadItem) => {
    setSelectedLead(lead);
    setSelectedPlan('PRO');
    setCreditsToGrant(300);
    setEnableProfileHighlight(true);
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

  const handleConfirmConversion = () => {
    if (!selectedLead) return;
    setIsSubmitting(true);

    if (typeof window !== 'undefined') {
      // 1. Update lead status
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

      // 2. Provision/Create User in local storage
      const userObj = {
        _id: 'user_' + Date.now(),
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

      // If converting currently logged user or general user list
      localStorage.setItem('user', JSON.stringify(userObj));
      window.dispatchEvent(new Event('user-updated'));
      window.dispatchEvent(new Event('user-credits-updated'));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsConvertModalOpen(false);
      setSuccessMessage(
        `Lead converted successfully! ${selectedLead.name} (${selectedLead.email}) onboarded to ${selectedPlan} Plan with ${creditsToGrant} Credits (Admin Granted).`
      );
    }, 600);
  };

  const columns: Column<DemoLeadItem>[] = [
    {
      key: 'name',
      header: 'Lead Name & Contact',
      sortable: true,
      accessor: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs">
            {lead.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs">{lead.name}</span>
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
          <Phone className="w-3.5 h-3.5 text-blue-500" />
          <span>{lead.phone}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company & Volume',
      accessor: (lead) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-indigo-500" /> {lead.companyName || 'N/A'}
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Converted ({lead.convertedPlan || 'PRO'} - {lead.convertedCredits} Cr)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3 h-3" /> Pending Review
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
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Convert & Assign Plan</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Account Active
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DataTable Component with top header search integration */}
      <DataTable
        data={leads}
        columns={columns}
        isLoading={isLoading}
        externalSearchQuery={searchQuery}
        hideSearchInput={true}
        emptyMessage="No demo request leads found. Click 'Book a Demo' on homepage to test submitting a lead."
      />

      {/* ADMIN CONVERT & PROVISION MODAL */}
      <AnimatePresence>
        {isConvertModalOpen && selectedLead && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-5"
            >
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold mb-2">
                  <UserCheck className="w-3.5 h-3.5" /> Admin Account Provisioning
                </span>
                <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Convert Lead to Active Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Onboard <strong className="text-slate-900 dark:text-white">{selectedLead.name}</strong> ({selectedLead.email}) directly without requiring credit card checkout.
                </p>
              </div>

              {/* Lead Summary Info Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <p className="text-slate-500 font-medium">Contact Phone: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.phone}</span></p>
                <p className="text-slate-500 font-medium">Company: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLead.companyName || 'N/A'}</span> ({selectedLead.estimatedRenders})</p>
              </div>

              {/* Plan Selection Dropdown */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Select Subscription Plan for User:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'FREE', label: 'Free Tier', credits: 0, highlight: false },
                    { id: 'STARTER', label: 'Starter Plan', credits: 100, highlight: false },
                    { id: 'PRO', label: 'Pro Plan', credits: 300, highlight: true },
                    { id: 'ENTERPRISE', label: 'Enterprise Plan', credits: 1000, highlight: true },
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanChange(plan.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedPlan === plan.id
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold text-xs flex items-center justify-between">
                        <span>{plan.label}</span>
                        {plan.highlight && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {plan.credits} Credits
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Credit Override */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Credits Balance:
                </label>
                <div className="relative">
                  <Zap className="absolute left-3.5 top-3 w-4 h-4 text-amber-500" />
                  <input
                    type="number"
                    value={creditsToGrant}
                    onChange={(e) => setCreditsToGrant(parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Profile Highlight Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Enable Profile Highlight (Gemini Ring & Crown Badge)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableProfileHighlight}
                  onChange={(e) => setEnableProfileHighlight(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Payment Method Badge */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment Status
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-100">
                  ADMIN GRANTED (0 COST)
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmConversion}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Approve & Activate Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
