import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Package, 
  Boxes, 
  ShoppingCart, 
  Loader2,
  Mail,
  Phone,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { tenantUserService } from '../../api/tenantUserService';
import type { TenantUser, CreateTenantUserPayload, UserStatus } from '../../types/auth';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface TenantAdminDashboardProps {
  onNavigate: (tab: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  productCount?: number;
  lowStockCount?: number;
}

export const TenantAdminDashboard: React.FC<TenantAdminDashboardProps> = ({
  onNavigate,
  onShowToast,
  productCount = 0,
  lowStockCount = 0,
}) => {
  const { user, activeTenantSlug } = useAuth();
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Form state for creating tenant user
  const [formData, setFormData] = useState<CreateTenantUserPayload>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'INVENTORY_MANAGER',
  });

  const loadUsers = useCallback(async () => {
    if (user?.role === 'SUPER_ADMIN' && !user?.tenantId && !activeTenantSlug) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await tenantUserService.getUsers(user?.tenantId ?? undefined);
      setUsers(data);
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast, user?.tenantId, user?.role, activeTenantSlug]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await tenantUserService.createUser(formData, user?.tenantId ?? undefined);
      onShowToast('success', `User ${created.name} (${created.role}) created successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'INVENTORY_MANAGER',
      });
      loadUsers();
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: TenantUser) => {
    setActionLoadingId(targetUser.id);
    const nextStatus: UserStatus = targetUser.userStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await tenantUserService.updateUserStatus(targetUser.id, nextStatus, user?.tenantId ?? undefined);
      onShowToast('info', `User status updated to ${nextStatus}`);
      loadUsers();
    } catch (err) {
      onShowToast('error', getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {user?.companyName || 'Tenant Store'}
            </span>
            <span className="text-xs text-slate-400 font-mono">[{user?.schemaName || 'tenant_schema'}]</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant Administrator Portal</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your store operations, team members, permissions, and business catalog.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>
      {user?.role === 'SUPER_ADMIN' && !user?.tenantId && !activeTenantSlug && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>No client tenant selected.</strong> Please select a client tenant in the{' '}
            <button
              onClick={() => onNavigate('superadmin-tenants')}
              className="underline font-semibold text-amber-300 hover:text-white"
            >
              Client Tenants & Schemas
            </button>{' '}
            tab to manage its team members.
          </div>
        </div>
      )}

      {/* Quick Ops Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigate('pos')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-left hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 text-sm">POS Terminal</div>
          <div className="text-[11px] text-slate-500">Fast checkout register</div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-left hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 text-sm">Catalog ({productCount})</div>
          <div className="text-[11px] text-slate-500">Products & pricing</div>
        </button>

        <button
          onClick={() => onNavigate('inventory')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-left hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 text-sm">Inventory</div>
          <div className="text-[11px] text-slate-500">{lowStockCount} items low</div>
        </button>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-left">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
            <Users className="w-4 h-4" />
          </div>
          <div className="font-bold text-slate-900 text-sm">Team Staff</div>
          <div className="text-[11px] text-slate-500">{users.length} active members</div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Store Staff & RBAC Roles</h3>
            <p className="text-xs text-slate-500">
              Only roles Inventory Manager, Accountant, and Cashier can be provisioned by Tenant Admin.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5 text-indigo-600" />
                    <span>Loading team members...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No team members found. Click "Add Team Member" above.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActioning = actionLoadingId === u.id;
                  const isOwner = u.role === 'TENANT_ADMIN';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'TENANT_ADMIN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            👑 Tenant Admin (Owner)
                          </span>
                        )}
                        {u.role === 'INVENTORY_MANAGER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            📦 Inventory Manager
                          </span>
                        )}
                        {u.role === 'ACCOUNTANT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            📊 Accountant
                          </span>
                        )}
                        {u.role === 'CASHIER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            💳 Cashier
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {u.userStatus === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isOwner && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isActioning}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors border ${
                              u.userStatus === 'ACTIVE'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isActioning ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : u.userStatus === 'ACTIVE' ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Store Team Member</h3>
                  <p className="text-[11px] text-slate-500">RBAC enforces restricted roles</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="alex@store.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 555 123 4567"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Dropdown - Restricted */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assign Store Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as any }))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="INVENTORY_MANAGER">📦 Inventory Manager (Stock, Catalog, Movements)</option>
                  <option value="ACCOUNTANT">📊 Accountant (Sales reports, Invoices, Taxes)</option>
                  <option value="CASHIER">💳 Cashier (POS Terminal & Register)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Note: Tenant Admins cannot create Super Admin or Tenant Admin accounts.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Add Member</span>
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
