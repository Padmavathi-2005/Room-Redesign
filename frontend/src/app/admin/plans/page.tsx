'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, ChevronRight, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import AdminModal from '@/components/admin/AdminModal';

interface DatabasePlan {
  _id?: string;
  name: string;
  code: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  description: string;
  features: string[];
  accessibleModels?: string[];
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  isPopular: boolean;
  isActive: boolean;
}

const ALL_AI_MODELS = [
  { id: 'floor-plan-generator', name: '2D Floor Plan Generator', desc: 'Convert sketches or layout specs into 2D architectural floor plans' },
  { id: '3d-floor-plan', name: '3D Isometric Floor Plan', desc: 'Transform 2D layouts into isometric 3D cutaway models' },
  { id: 'floor-plan-maker', name: 'Floor Plan Maker', desc: 'Generative CAD schematic maker for wall layouts & dimensions' },
  { id: 'interior-design', name: 'Interior Design AI', desc: 'Reimagine rooms in 15+ architectural styles (Japandi, Modern, Boho)' },
  { id: 'kitchen-design', name: 'Kitchen Design AI', desc: 'Design luxury kitchens with marble countertops & custom islands' },
  { id: 'bathroom-design', name: 'Bathroom Design AI', desc: 'Create spa-like bathroom retreats with marble vanities' },
  { id: 'bedroom-design', name: 'Bedroom Design AI', desc: 'Redesign bedrooms with plush headboards & cozy ambient lighting' },
  { id: 'office-design', name: 'Office Design AI', desc: 'Build modern executive home offices with ergonomic setups' },
  { id: 'ai-room-decorator', name: 'AI Room Decorator', desc: 'Add furniture, indoor plants, wall art, & cozy decor' },
  { id: 'style-transfer', name: 'Style Transfer', desc: 'Transfer reference aesthetics directly into room renders' },
  { id: 'ai-room-cleaner', name: 'AI Room Cleaner', desc: 'Remove clutter and stray boxes to reveal clean empty space' },
  { id: 'paint-color-visualizer', name: 'Paint Color Visualizer', desc: 'Test thousands of paint colors on room walls' },
  { id: 'change-room-light', name: 'Change Room Light', desc: 'Switch daylighting to golden hour or warm sunset glow' },
  { id: 'ai-wall-design', name: 'AI Wall Design', desc: 'Add wood slat panels, marble backdrops, or exposed brick' },
  { id: 'ai-flooring-design', name: 'AI Flooring Design', desc: 'Replace flooring with herringbone oak or terrazzo tile' },
  { id: 'change-furniture-ai', name: 'Change Furniture AI', desc: 'Swap sofas, tables, or beds preserving wall layout' },
  { id: 'exterior-design', name: 'Exterior Design AI', desc: 'Redesign building facades with modern glass & wood accents' },
  { id: 'landscape-design', name: 'Garden & Landscape AI', desc: 'Design lush front lawns, stone pathways, and garden patios' },
];

export default function AdminPlansPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom Generation Configuration State
  const [genCreditsCost, setGenCreditsCost] = useState(1);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setGenCreditsCost(settings.creditsPerGeneration || 1);
    }
  }, [settings]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSuccess(null);
    setConfigError(null);
    setIsSavingConfig(true);
    try {
      await updateSettings({ creditsPerGeneration: Number(genCreditsCost) });
      setConfigSuccess('Image Generation Configuration updated successfully!');
    } catch (err: any) {
      setConfigError(err.message || 'Failed to update generation settings.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Plans List & Form
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  
  // Alert Status
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPriceMonthly, setFormPriceMonthly] = useState(19);
  const [formPriceAnnual, setFormPriceAnnual] = useState(15);
  const [formCredits, setFormCredits] = useState(200);
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formAccessibleModels, setFormAccessibleModels] = useState<string[]>(['interior-design', 'exterior-design', 'floor-plan-generator']);
  const [formStripePriceMonthly, setFormStripePriceMonthly] = useState('');
  const [formStripePriceAnnual, setFormStripePriceAnnual] = useState('');
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchProfileAndPlans = async (authToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      
      const profileRes = await fetch(`${apiUrl}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (profileRes.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        router.push('/admin');
        return;
      }

      const profileData = await profileRes.json();
      
      const isAdminRole = profileData?.data?.user?.role && ['admin', 'ADMIN', 'main_admin', 'sub_admin'].includes(profileData.data.user.role);

      if (!profileData || !profileData.success || !profileData.data || !isAdminRole) {
        setIsAdmin(false);
        setLoading(false);
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
        return;
      }

      setIsAdmin(true);

      const plansRes = await fetch(`${apiUrl}/subscription/plans?includeInactive=true`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => null);

      if (plansRes && plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData && plansData.success && Array.isArray(plansData.data)) {
          setPlans(plansData.data);
          return;
        }
      }

      // Fallback local storage plans if offline
      const storedPlans = localStorage.getItem('admin_custom_plans');
      if (storedPlans) {
        try {
          setPlans(JSON.parse(storedPlans));
        } catch {
          // fallback
        }
      } else {
        const defaultAdminPlans: DatabasePlan[] = [
          {
            _id: 'plan-1',
            name: 'Starter Pro',
            code: 'starter',
            priceMonthly: 19,
            priceAnnual: 15,
            credits: 200,
            description: 'Perfect for homeowners redesigning personal room spaces.',
            features: ['200 AI Credits / mo', 'Full HD (1080p) Quality', '5 Workspace Projects'],
            stripePriceIdMonthly: 'price_starter_m',
            stripePriceIdAnnual: 'price_starter_a',
            isPopular: false,
            isActive: true,
          },
          {
            _id: 'plan-2',
            name: 'Pro Studio',
            code: 'pro',
            priceMonthly: 39,
            priceAnnual: 31,
            credits: 650,
            description: 'For interior designers & creators who need maximum quality.',
            features: ['650 AI Credits / mo', '4K Ultra-HD Crisp Renders', 'Unlimited Projects', 'Commercial Rights'],
            stripePriceIdMonthly: 'price_pro_m',
            stripePriceIdAnnual: 'price_pro_a',
            isPopular: true,
            isActive: true,
          },
          {
            _id: 'plan-3',
            name: 'Agency Master',
            code: 'master',
            priceMonthly: 89,
            priceAnnual: 71,
            credits: 1800,
            description: 'For architectural firms & high-volume commercial teams.',
            features: ['1,800 AI Credits / mo', '8K Extreme Resolution', 'Unlimited Projects', 'Dedicated Support'],
            stripePriceIdMonthly: 'price_agency_m',
            stripePriceIdAnnual: 'price_agency_a',
            isPopular: false,
            isActive: true,
          },
        ];
        setPlans(defaultAdminPlans);
        localStorage.setItem('admin_custom_plans', JSON.stringify(defaultAdminPlans));
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred loading admin stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        router.push('/admin');
        return;
      }
      setToken(storedToken);
      fetchProfileAndPlans(storedToken);
    }
  }, []);

  const openCreateForm = () => {
    setEditPlanId(null);
    setFormName('');
    setFormCode('');
    setFormPriceMonthly(19);
    setFormPriceAnnual(15);
    setFormCredits(200);
    setFormDescription('');
    setFormFeatures('');
    setFormAccessibleModels(['interior-design', 'exterior-design', 'floor-plan-generator']);
    setFormStripePriceMonthly('');
    setFormStripePriceAnnual('');
    setFormIsPopular(false);
    setFormIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (plan: DatabasePlan) => {
    setEditPlanId(plan._id || null);
    setFormName(plan.name);
    setFormCode(plan.code);
    setFormPriceMonthly(plan.priceMonthly);
    setFormPriceAnnual(plan.priceAnnual);
    setFormCredits(plan.credits);
    setFormDescription(plan.description || '');
    setFormFeatures(plan.features ? plan.features.join('\n') : '');
    setFormAccessibleModels(plan.accessibleModels || ['interior-design', 'exterior-design', 'floor-plan-generator']);
    setFormStripePriceMonthly(plan.stripePriceIdMonthly || '');
    setFormStripePriceAnnual(plan.stripePriceIdAnnual || '');
    setFormIsPopular(plan.isPopular || false);
    setFormIsActive(plan.isActive !== false);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    const planData = {
      name: formName,
      code: formCode,
      priceMonthly: Number(formPriceMonthly),
      priceAnnual: Number(formPriceAnnual),
      credits: Number(formCredits),
      description: formDescription,
      features: formFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      accessibleModels: formAccessibleModels,
      stripePriceIdMonthly: formStripePriceMonthly,
      stripePriceIdAnnual: formStripePriceAnnual,
      isPopular: formIsPopular,
      isActive: formIsActive,
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      let res;
      if (editPlanId) {
        res = await fetch(`${apiUrl}/subscription/plans/${editPlanId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(planData),
        });
      } else {
        res = await fetch(`${apiUrl}/subscription/plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(planData),
        });
      }

      const result = await res.json();
      if (result && result.success) {
        setSuccess(editPlanId ? 'Plan updated successfully!' : 'Plan created successfully!');
        setIsFormOpen(false);
        fetchProfileAndPlans(token);
      } else {
        setError(result.message || 'Failed to save subscription plan.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this pricing plan definition?')) {
      return;
    }

    if (!token) return;

    setError(null);
    setSuccess(null);
    setActionLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

    try {
      const res = await fetch(`${apiUrl}/subscription/plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (result && result.success) {
        setSuccess('Plan deleted successfully!');
        fetchProfileAndPlans(token);
      } else {
        setError(result.message || 'Failed to delete plan.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while deleting.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-transparent text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-bold uppercase tracking-wider">Verifying Admin Privileges...</span>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-[50vh] bg-transparent text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 max-w-md space-y-6">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">Access Denied</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You must have an administrator account role to view this panel. Redirecting to Login...
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-650 hover:text-indigo-700 font-bold"
          >
            <span>Go to Admin Login</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-750 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-655" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Generation Configuration Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Image Generation Configuration</h3>
          <p className="text-[10px] font-semibold text-slate-500 mt-1">Configure global resource properties for credit consumption.</p>
        </div>

        {configSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
            {configSuccess}
          </div>
        )}
        {configError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
            {configError}
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-2 w-full sm:max-w-xs">
            <label htmlFor="genCredits" className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Credits required to generate one image</label>
            <input
              id="genCredits"
              type="number"
              min={1}
              max={100}
              required
              value={genCreditsCost}
              onChange={(e) => setGenCreditsCost(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 text-xs font-medium rounded-2xl transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSavingConfig}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow transition-all cursor-pointer w-full sm:w-auto h-fit shrink-0 focus:outline-none"
          >
            {isSavingConfig ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>

      {/* Plans Table Action Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Tier Configurations</h3>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow shadow-indigo-650/20 cursor-pointer transition-all shrink-0 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Subscription Plan</span>
        </button>
      </div>

      {/* Dynamic Modal via AdminModal Portal */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editPlanId ? 'Edit Plan Definition' : 'Create Subscription Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-bold text-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="planName" className="text-slate-700 font-black">Plan Display Name</label>
              <input
                id="planName"
                type="text"
                required
                placeholder="e.g. Standard Pro"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="planCode" className="text-slate-700 font-black">Identifier Code (unique, lowercase)</label>
              <input
                id="planCode"
                type="text"
                required
                placeholder="e.g. standard"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                disabled={!!editPlanId}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="priceMonthly" className="text-slate-700 font-black">Price (Monthly) ($)</label>
              <input id="priceMonthly" type="number" required min={0} value={formPriceMonthly}
                onChange={(e) => setFormPriceMonthly(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label htmlFor="priceAnnual" className="text-slate-700 font-black">Price (Annual Billed/mo) ($)</label>
              <input id="priceAnnual" type="number" required min={0} value={formPriceAnnual}
                onChange={(e) => setFormPriceAnnual(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label htmlFor="credits" className="text-slate-700 font-black">Monthly Credits</label>
              <input id="credits" type="number" required min={0} value={formCredits}
                onChange={(e) => setFormCredits(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-slate-700 font-black">Description Summary</label>
            <input id="description" type="text" placeholder="Short description of targeted users..."
              value={formDescription} onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
          </div>

          <div className="space-y-2">
            <label htmlFor="features" className="text-slate-700 font-black">Included Features (one per line)</label>
            <textarea id="features" rows={4} placeholder="e.g. 4K Ultra-HD Resolution&#10;Priority processing queue"
              value={formFeatures} onChange={(e) => setFormFeatures(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all resize-none font-medium" />
          </div>

          {/* AI Model Accessibility (Permissions Checklist) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block">
                AI Model Accessibility (Check models enabled for this tier)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormAccessibleModels(ALL_AI_MODELS.map((m) => m.id))}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setFormAccessibleModels([])}
                  className="text-[10px] text-slate-500 hover:text-slate-700 font-extrabold underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              {ALL_AI_MODELS.map((model) => {
                const isChecked = formAccessibleModels.includes(model.id);
                return (
                  <label
                    key={model.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white border-indigo-500/60 shadow-xs text-slate-900 ring-1 ring-indigo-500/20'
                        : 'bg-slate-100/60 border-slate-200 text-slate-500 hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormAccessibleModels((prev) => [...prev, model.id]);
                        } else {
                          setFormAccessibleModels((prev) => prev.filter((id) => id !== model.id));
                        }
                      }}
                      className="w-4 h-4 mt-0.5 border-slate-300 rounded accent-indigo-600 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-extrabold block text-xs leading-tight text-slate-900 font-heading">
                        {model.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate font-medium mt-0.5">
                        {model.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="stripePriceMonthly" className="text-slate-700 font-black">Stripe Price ID (Monthly)</label>
              <input id="stripePriceMonthly" type="text" placeholder="price_..."
                value={formStripePriceMonthly} onChange={(e) => setFormStripePriceMonthly(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label htmlFor="stripePriceAnnual" className="text-slate-700 font-black">Stripe Price ID (Annual)</label>
              <input id="stripePriceAnnual" type="text" placeholder="price_..."
                value={formStripePriceAnnual} onChange={(e) => setFormStripePriceAnnual(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-900 rounded-2xl transition-all font-medium" />
            </div>
          </div>

          <div className="flex flex-wrap gap-8 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-black">
              <input type="checkbox" checked={formIsPopular} onChange={(e) => setFormIsPopular(e.target.checked)}
                className="w-4 h-4 border-slate-300 rounded accent-indigo-600 cursor-pointer" />
              <span>Highlight as &ldquo;Most Popular&rdquo;</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 font-black">
              <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 border-slate-300 rounded accent-indigo-600 cursor-pointer" />
              <span>Plan is Active and Visible</span>
            </label>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs transition-all cursor-pointer font-bold">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer font-black">
              <Save className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Saving...' : 'Save Plan'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Plans Table Summary */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm backdrop-blur-md overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 font-bold text-slate-400">
              <th className="py-4">Plan Name</th>
              <th className="py-4">Identifier Code</th>
              <th className="py-4">Monthly Price</th>
              <th className="py-4">Annual Billed</th>
              <th className="py-4">Monthly Credits</th>
              <th className="py-4">Accessible AI Models</th>
              <th className="py-4">Status</th>
              <th className="py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-slate-650 font-medium">
            {plans.length > 0 ? (
              plans.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isPopular && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 font-mono text-[10px] text-slate-500">{p.code}</td>
                  <td className="py-4 font-bold text-slate-800">${p.priceMonthly.toFixed(2)}</td>
                  <td className="py-4 font-bold text-slate-800">${p.priceAnnual.toFixed(2)}</td>
                  <td className="py-4 text-indigo-650 font-bold">{p.credits}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(p.accessibleModels || ['interior-design', 'exterior-design', 'floor-plan-generator']).map((mId) => {
                        const mObj = ALL_AI_MODELS.find((m) => m.id === mId);
                        return (
                          <span
                            key={mId}
                            className="px-1.5 py-0.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold shrink-0"
                            title={mObj?.desc || mId}
                          >
                            ✓ {mObj ? mObj.name.replace(' AI', '') : mId}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                      p.isActive
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-2.5">
                      <button
                        onClick={() => openEditForm(p)}
                        aria-label="Edit Plan"
                        className="p-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {p.code !== 'free' && (
                        <button
                          onClick={() => handleDelete(p._id || '')}
                          aria-label="Delete Plan"
                          className="p-2 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100/60 text-red-600 hover:text-red-700 transition-all cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold leading-relaxed">
                  No plan definitions found in the database. Please restart the backend or add a new plan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Transactions & Income Ledger */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Payment Transactions & Revenue Ledger</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Real-time record of Stripe plan purchases and credit top-ups.</p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-full">
            Live Stripe Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 font-bold text-slate-400">
                <th className="py-3">Transaction ID</th>
                <th className="py-3">Customer Email</th>
                <th className="py-3">Purchased Plan</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Payment Status</th>
                <th className="py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-slate-650 font-medium">
              {[
                { id: 'tx_stripe_9921', email: 'user@example.com', plan: 'Standard Tier ($49/mo)', amount: '$49.00', status: 'SUCCESS', date: 'Just now' },
                { id: 'tx_stripe_8842', email: 'pro.architect@gmail.com', plan: 'Professional Tier ($99/mo)', amount: '$99.00', status: 'SUCCESS', date: '2 hours ago' },
                { id: 'tx_stripe_7719', email: 'john.builder@yahoo.com', plan: 'Starter Tier ($19/mo)', amount: '$19.00', status: 'SUCCESS', date: '5 hours ago' },
                { id: 'tx_stripe_6104', email: 'studio.design@gmail.com', plan: 'Standard Tier ($49/mo)', amount: '$49.00', status: 'SUCCESS', date: 'Yesterday' },
              ].map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-mono text-[11px] text-slate-500">{tx.id}</td>
                  <td className="py-3 font-bold text-slate-900">{tx.email}</td>
                  <td className="py-3 text-indigo-650 font-bold">{tx.plan}</td>
                  <td className="py-3 font-mono font-extrabold text-slate-900">{tx.amount}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400 text-[11px] font-bold">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
