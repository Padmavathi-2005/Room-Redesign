'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
  Tag,
} from 'lucide-react';

export interface CheckoutPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  credits: number;
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CheckoutPlan | null;
  onSuccess: (creditsAdded: number, planName: string) => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  plan,
  onSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen || !plan) return null;

  const originalPrice = plan.price;
  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'ROOMAI20' || promoCode.trim().toUpperCase() === 'PROMO20') {
      setDiscountPercent(20);
      alert('Promo code applied! 20% discount added.');
    } else if (promoCode.trim().length > 0) {
      alert('Invalid promo code. Try "ROOMAI20" for 20% off.');
    }
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      // Add credits to user session in localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userObj = JSON.parse(storedUser);
            const currentCredits = userObj.credits || 100;
            userObj.credits = currentCredits + plan.credits;
            userObj.subscriptionTier = plan.name;
            localStorage.setItem('user', JSON.stringify(userObj));
          } catch {
            // fallback
          }
        }
        
        // Dispatch custom global event to notify Header and state listeners
        window.dispatchEvent(new Event('user-credits-updated'));
      }

      setTimeout(() => {
        onSuccess(plan.credits, plan.name);
        setIsCompleted(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed top-0 left-0 w-screen h-screen z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
        data-modal-open="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted ? (
          /* Payment Success State */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              Payment Successful!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your subscription to <span className="font-bold text-purple-600 dark:text-purple-400">{plan.name}</span> has been activated. <span className="font-bold">{plan.credits.toLocaleString()} AI Credits</span> have been added to your account!
            </p>
          </div>
        ) : (
          /* Payment Form State */
          <form onSubmit={handleCompletePayment} className="space-y-6">
            {/* Header Title & Plan Overview */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-200 dark:border-purple-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>256-Bit SSL Encrypted Secure Checkout</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                Subscribe to {plan.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant access to {plan.credits.toLocaleString()} monthly generation credits and all AI tools.
              </p>
            </div>

            {/* Plan Breakdown Card */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-purple-600/20" />
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                    {plan.name} ({plan.billingCycle === 'annual' ? 'Billed Annually' : 'Monthly'})
                  </span>
                </div>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  +{plan.credits.toLocaleString()} Credits / month
                </p>
              </div>

              <div className="text-right">
                <div className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  ${finalPrice.toFixed(2)}
                </div>
                {discountAmount > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-600 line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Tabs */}
            {/* Payment Method Tabs */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Payment Method (Stripe & PayPal Only)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-2xs ring-1 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Stripe (Credit / Debit Card)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`py-3 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'paypal'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-2xs ring-1 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-500" />
                  <span>PayPal Express</span>
                </button>
              </div>
            </div>

            {/* Credit Card (Stripe) Inputs */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600 pr-10"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      CVC / CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600 pr-10"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Inputs */}
            {paymentMethod === 'paypal' && (
              <div className="space-y-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    PP
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      PayPal Express Checkout
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Pay securely using your PayPal account balance or linked cards.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PayPal Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Promo Code Entry */}
            <div className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Promo Code (Try ROOMAI20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600 pl-9"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 hover:text-purple-600 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ${finalPrice.toFixed(2)} & Activate Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
