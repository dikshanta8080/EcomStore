import React, { useState } from 'react';
import { Plus, Scale, Edit2, Trash2 } from 'lucide-react';
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
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Weight
          </span>
        );
      case 'VOLUME':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
            Volume
          </span>
        );
      case 'COUNT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
            Count / Pkg
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
            Custom
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Units of Measure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure measurement standards (KG, Liter, Piece) and packaging units
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUnit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Unit
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        {(['ALL', 'WEIGHT', 'VOLUME', 'COUNT', 'OTHER'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type)}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              selectedFilter === type
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {type === 'ALL' ? 'All Units' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
        {isLoading ? (
          <LoadingSpinner message="Fetching units..." />
        ) : filteredUnits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={selectedFilter !== 'ALL' ? `No ${selectedFilter.toLowerCase()} units found` : 'No units defined'}
              description="Define standard units to enable conversion and packaging management."
              actionText="Add New Unit"
              onAction={() => {
                setEditingUnit(null);
                setIsModalOpen(true);
              }}
              icon={<Scale className="h-6 w-6 text-slate-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Unit Name</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      #{unit.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {unit.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-bold">
                      {unit.symbol}
                    </td>
                    <td className="py-3 px-4">
                      {getTypeBadge(unit.unitType)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingUnit(unit);
                            setIsModalOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Unit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUnit(unit)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Unit Form Modal */}
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
        isOpen={Boolean(deletingUnit)}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete unit "${deletingUnit?.name}"?`}
        message={`Are you sure you want to delete unit "${deletingUnit?.name}" (${deletingUnit?.symbol})? This action cannot be undone if products or conversions depend on it.`}
        confirmText="Delete Unit"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};
