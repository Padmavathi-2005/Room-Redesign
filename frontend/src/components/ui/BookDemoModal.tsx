'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, User, Mail, Phone, Building2, Layers, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [estimatedRenders, setEstimatedRenders] = useState('50-200 renders/mo');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Full Name, Email, and Phone Number are required.');
      return;
    }

    setIsSubmitting(true);

    const newLead = {
      id: 'lead_' + Date.now(),
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyName: companyName.trim() || 'N/A',
      estimatedRenders,
      notes: notes.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage demo_leads & dispatch event for Admin Console
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('demo_leads');
      let leads = [];
      if (existing) {
        try {
          leads = JSON.parse(existing);
        } catch (err) {
          leads = [];
        }
      }
      leads.unshift(newLead);
      localStorage.setItem('demo_leads', JSON.stringify(leads));

      // Also trigger a notification in admin notifications log
      const notificationsStr = localStorage.getItem('admin_notifications');
      let notifications = [];
      if (notificationsStr) {
        try {
          notifications = JSON.parse(notificationsStr);
        } catch {}
      }
      notifications.unshift({
        id: 'notif_' + Date.now(),
        type: 'DEMO_LEAD',
        title: 'New Demo Request',
        message: `${newLead.name} (${newLead.email}) requested a live demo.`,
        phone: newLead.phone,
        leadId: newLead.id,
        createdAt: new Date().toISOString(),
        read: false,
      });
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));

      window.dispatchEvent(new Event('demo-lead-submitted'));
      window.dispatchEvent(new Event('admin-notifications-updated'));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setNotes('');
    setErrorMsg('');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white"
        >
          {/* Close Button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSuccess ? (
            <div>
              {/* Header Badge & Title */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Book a VIP Demo
                </span>
                <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  Schedule Your Guided Demo
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Provide your details and our AI Onboarding Specialist will contact you to set up your custom portal & credit allocation.
                </p>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Demo Request Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="sarah@firm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Grid 2 cols for Company & Volume */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Studio
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Apex Architecture"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Monthly Volume */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Est. Monthly Renders
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <select
                        value={estimatedRenders}
                        onChange={(e) => setEstimatedRenders(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="50-200 renders/mo">50 - 200 renders/mo</option>
                        <option value="200-500 renders/mo">200 - 500 renders/mo</option>
                        <option value="500+ renders/mo">500+ renders/mo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Demo Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No credit card required. Admin onboarded access.
                </p>
              </form>
            </div>
          ) : (
            /* Success State Screen */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                Demo Request Submitted!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                Thank you <strong className="text-slate-800 dark:text-slate-200">{fullName}</strong>. Our AI Onboarding Specialist and Admin team have received your details.
              </p>
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 text-left text-xs space-y-1">
                <p className="font-bold text-blue-900 dark:text-blue-300">What happens next?</p>
                <p className="text-blue-700 dark:text-blue-400 text-[11px]">
                  1. Admin reviews your request and provisions your account.
                  <br />
                  2. Your selected plan and credit balance will be assigned directly without requiring payment.
                  <br />
                  3. Access credentials will be dispatched to <span className="underline">{email}</span>.
                </p>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                Close & Return to Home
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export default BookDemoModal;
