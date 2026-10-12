import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { getErrorMessage } from '../../api/client';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4 border border-indigo-400/20">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Retail SaaS Cloud
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Schema-per-tenant enterprise multi-tenant platform
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <span className="p-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">✕</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@saas.com or employee@store.com"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick Test Credentials By Role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => fillCredentials('superadmin@saas.com', 'SuperAdmin@123')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all col-span-1 sm:col-span-2 group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  👑
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">
                    Founder / Super Admin
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">superadmin@saas.com</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold shrink-0">
                  Master
                </span>
              </button>

              {/* Tenant Admin */}
              <button
                type="button"
                onClick={() => fillCredentials('tenantadmin@apex.com', 'TenantAdmin@123')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  🏢
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-indigo-400 truncate">
                    Tenant Admin
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">tenantadmin@apex.com</div>
                </div>
              </button>

              {/* Inventory Manager */}
              <button
                type="button"
                onClick={() => fillCredentials('inventory@apex.com', 'Inventory@123')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  📦
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 truncate">
                    Inventory Mgr
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">inventory@apex.com</div>
                </div>
              </button>

              {/* Accountant */}
              <button
                type="button"
                onClick={() => fillCredentials('accountant@apex.com', 'Accountant@123')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  📊
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-400 truncate">
                    Accountant
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">accountant@apex.com</div>
                </div>
              </button>

              {/* Cashier */}
              <button
                type="button"
                onClick={() => fillCredentials('cashier@apex.com', 'Cashier@123')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                  💳
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white group-hover:text-sky-400 truncate">
                    Cashier / POS
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">cashier@apex.com</div>
                </div>
              </button>
            </div>
            <div className="mt-3.5 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Isolated PostgreSQL schema per tenant with strict RBAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
