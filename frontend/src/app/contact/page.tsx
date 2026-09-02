'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Mail, Phone, Building2, Layers, CheckCircle2, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [estimatedRenders, setEstimatedRenders] = useState('50-200 renders/mo');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <Header />

      <section className="flex-grow pt-28 pb-20 relative px-6 sm:px-8 lg:px-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
        
        {/* Left Side: Text and Contact Info */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-2xs mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Request a Live Demo
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-tight">
              Let's Build <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Something Amazing</span>
            </h1>
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
              Provide your details and our AI Onboarding Specialist will contact you to set up your custom portal, credit allocation, and personalized demo.
            </p>
          </div>

          <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Us</p>
                <p className="text-sm font-semibold">enterprise@roomai.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Office</p>
                <p className="text-sm font-semibold">123 Innovation Drive, Tech District</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Demo Request Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200/90 dark:border-slate-800 w-full max-w-lg mx-auto relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-6">Enter your details</h3>

                  {/* Error Message Alert */}
                  {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Demo Request Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sarah Jenkins"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Business Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="sarah@firm.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 019-2834"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Grid 2 cols for Company & Volume */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Company / Studio
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Apex Architecture"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                        </div>
                      </div>

                      {/* Monthly Volume */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Est. Renders/mo
                        </label>
                        <div className="relative">
                          <Layers className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                          <select
                            value={estimatedRenders}
                            onChange={(e) => setEstimatedRenders(e.target.value)}
                            className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          >
                            <option value="50-200 renders/mo">50 - 200</option>
                            <option value="200-500 renders/mo">200 - 500</option>
                            <option value="500+ renders/mo">500+</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 pt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> No credit card required. Admin onboarded access.
                    </p>
                  </form>
                </motion.div>
              ) : (
                /* Success State Screen */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white mb-2">
                      Request Submitted!
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                      Thank you <strong className="text-slate-800 dark:text-slate-200">{fullName}</strong>. Our AI Onboarding Specialist and Admin team have received your details.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 text-left text-sm space-y-2">
                    <p className="font-bold text-blue-900 dark:text-blue-300">What happens next?</p>
                    <p className="text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
                      1. Admin reviews your request and provisions your account.
                      <br />
                      2. Your selected plan and credit balance will be assigned directly without requiring payment.
                      <br />
                      3. Access credentials will be dispatched to <span className="underline font-semibold">{email}</span>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
