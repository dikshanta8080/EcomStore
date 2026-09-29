import React, { useState } from 'react';
import { Plus, Scale, Edit2, Trash2, Tag } from 'lucide-react';
import type { Unit, UnitRequest, UnitType } from '../../types/unit';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { UnitFormModal } from './UnitFormModal';

interface UnitsPageProps {
  units: Unit[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onCreateUnit: (data: UnitRequest) => Promise<void>;
  onUpdateUnit: (id: number, data: UnitRequest) => Promise<void>;
  onDeleteUnit: (id: number) => Promise<void>;
}

export const UnitsPage: React.FC<UnitsPageProps> = ({
  units,
  isLoading,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | UnitType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredUnits = units.filter((u) => {
    if (selectedFilter === 'ALL') return true;
    return u.unitType === selectedFilter;
  });

  const handleCreateOrUpdate = async (data: UnitRequest) => {
    setActionLoading(true);
    try {
      if (editingUnit) {
        await onUpdateUnit(editingUnit.id, data);
      } else {
        await onCreateUnit(data);
      }
      setIsModalOpen(false);
      setEditingUnit(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUnit) return;
    setActionLoading(true);
    try {
      await onDeleteUnit(deletingUnit.id);
      setDeletingUnit(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeBadge = (type: UnitType) => {
    switch (type) {
      case 'WEIGHT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Weight
          </span>
        );
      case 'VOLUME':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Volume
          </span>
        );
      case 'COUNT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Count / Pkg
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Custom / Other
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Unit Type Filters */}
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
          {(['ALL', 'WEIGHT', 'VOLUME', 'COUNT', 'OTHER'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                selectedFilter === type
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Units' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingUnit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Unit
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Fetching units..." />
        ) : filteredUnits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={selectedFilter !== 'ALL' ? `No ${selectedFilter} units found` : 'No units defined yet'}
              description="Create standard units (KG, Liter, Piece) or custom units (Bora, Packet, Box) to manage inventory."
              actionText="Add New Unit"
              onAction={() => {
                setEditingUnit(null);
                setIsModalOpen(true);
              }}
              icon={<Scale className="h-7 w-7 text-indigo-500" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Unit Name</th>
                  <th className="px-6 py-3.5">Symbol</th>
                  <th className="px-6 py-3.5">Dimension Type</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-400">
                      #{u.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-800 text-xs border border-slate-200">
                        {u.symbol}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(u.unitType)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingUnit(u);
                            setIsModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit Unit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUnit(u)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <UnitFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        unit={editingUnit}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete unit "${deletingUnit?.name}"?`}
        message={`Are you sure you want to delete unit "${deletingUnit?.symbol}"? Units used in products or historical stock movements cannot be deleted.`}
        confirmText="Delete Unit"
        isLoading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
