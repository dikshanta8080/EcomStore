import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Store,
  Layers,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { superAdminService } from '../../api/superAdminService';
import type { Tenant, SuperAdminStats, CreateTenantPayload, TenantStatus } from '../../types/auth';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface SuperAdminDashboardProps {
  onInspectTenant?: (tenant: Tenant) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  onInspectTenant, 
  onShowToast 
}) => {
  const { setActiveTenantSlug } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Form state for tenant provisioning
  const [formData, setFormData] = useState<CreateTenantPayload>({
    companyName: '',
    tenantSlug: '',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const loadData = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const [tenantsData, statsData] = await Promise.all([
        superAdminService.getTenants(query),
        superAdminService.getStats(),
      ]);
      setTenants(tenantsData);
      setStats(statsData);
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleSlugAutoFill = (companyName: string) => {
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      companyName,
      tenantSlug: slug,
    }));
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await superAdminService.createTenant(formData);
      onShowToast('success', `Tenant "${created.companyName}" and schema "${created.schemaName}" created successfully!`);
      setIsProvisionModalOpen(false);
      setFormData({
        companyName: '',
        tenantSlug: '',
        email: '',
        phone: '',
        address: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
      loadData();
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: TenantStatus) => {
    setActionLoadingId(id);
    try {
      await superAdminService.updateTenantStatus(id, newStatus);
      onShowToast('info', `Tenant status updated to ${newStatus}`);
      loadData(searchQuery);
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* SaaS Founder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
              👑 Founder & Super Admin
            </span>
            <span className="text-xs text-slate-400">Schema-per-Tenant Orchestration</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">SaaS Tenant Management</h2>
          <p className="text-sm text-slate-400">
            Search clients, provision isolated PostgreSQL schemas, and manage tenant lifecycles.
          </p>
        </div>

        <button
          onClick={() => setIsProvisionModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Client Tenant</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tenants</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats?.totalTenants ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">SaaS Client Organizations</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats?.activeTenants ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Live client schemas</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats?.suspendedTenants ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Access restricted</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deactivated</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats?.deactivatedTenants ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Archived/Terminated</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats?.totalUsers ?? 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registered staff across stores</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search client by company name, slug, or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(searchQuery)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Client Company</th>
                <th className="py-3 px-4">PostgreSQL Schema</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Company Contact</th>
                <th className="py-3 px-4">Users</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading client tenants...</span>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No client tenants found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Provision Client Tenant" to onboard a new store</p>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => {
                  const isRowLoading = actionLoadingId === t.id;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{t.companyName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">slug: {t.tenantSlug}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          {t.schemaName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {t.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                        {t.status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Suspended
                          </span>
                        )}
                        {t.status === 'DEACTIVATED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{t.email}</span>
                        </div>
                        {t.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{t.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {t.userCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isRowLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          ) : (
                            <>
                              {/* Suspend / Reactivate Controls */}
                              {t.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleStatusChange(t.id, 'SUSPENDED')}
                                  title="Suspend tenant access"
                                  className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold text-[11px] transition-colors"
                                >
                                  Suspend
                                </button>
                              )}

                              {t.status === 'SUSPENDED' && (
                                <button
                                  onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                                  title="Reactivate tenant"
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition-colors"
                                >
                                  Reactivate
                                </button>
                              )}

                              {t.status !== 'DEACTIVATED' && (
                                <button
                                  onClick={() => handleStatusChange(t.id, 'DEACTIVATED')}
                                  title="Deactivate tenant completely"
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition-colors"
                                >
                                  Deactivate
                                </button>
                              )}

                              {t.status === 'DEACTIVATED' && (
                                <button
                                  onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                                  title="Reactivate tenant"
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition-colors"
                                >
                                  Reactivate
                                </button>
                              )}

                              {/* Inspect Store Button */}
                              {onInspectTenant && (
                                <button
                                  onClick={() => {
                                    setActiveTenantSlug(t.tenantSlug);
                                    onInspectTenant(t);
                                  }}
                                  title="Inspect Store Schema & Data"
                                  className="p-1 rounded text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision New Client Tenant Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision Client Tenant</h3>
                  <p className="text-xs text-slate-500">Creates isolated schema and assigns initial Tenant Admin</p>
                </div>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionTenant} className="space-y-4 pt-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Client Organization Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleSlugAutoFill(e.target.value)}
                      placeholder="e.g. Acme Supermarket"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tenant Slug * (Subdomain)</label>
                    <input
                      type="text"
                      required
                      value={formData.tenantSlug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tenantSlug: e.target.value.toLowerCase() }))}
                      placeholder="e.g. acme-supermarket"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-indigo-600 font-mono bg-indigo-50 p-2 rounded border border-indigo-100 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Target Schema: <strong>tenant_{formData.tenantSlug.replace(/[^a-z0-9_]/g, '') || '<slug>'}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@acme.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Initial Tenant Admin User */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Initial Tenant Admin Credentials (Role: TENANT_ADMIN)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, adminName: e.target.value }))}
                    placeholder="e.g. John Doe"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
                      placeholder="admin@acme.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admin Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.adminPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, adminPassword: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Provisioning Schema...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Tenant & Build Schema</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
