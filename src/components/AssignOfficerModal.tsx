import React, { useState } from 'react';
import { X, Shield, UserCheck } from 'lucide-react';
import { FIR, PoliceOfficer } from '../types';

interface AssignOfficerModalProps {
  fir: FIR | null;
  officers: PoliceOfficer[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (firId: number, officer: PoliceOfficer) => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  fir,
  officers,
  isOpen,
  onClose,
  onAssign
}) => {
  if (!isOpen || !fir) return null;

  const [selectedOfficerId, setSelectedOfficerId] = useState<number>(officers[0]?.id || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const officer = officers.find(o => o.id === selectedOfficerId);
    if (!officer) return;

    onAssign(fir.id, officer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B132B] text-white p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Assign Investigating Officer (IO)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 font-mono">{fir.firNumber}</p>
            <p className="text-slate-600 mt-0.5">{fir.categoryName} · {fir.incidentLocation}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Officer from Station Roster *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {officers.map(off => (
                <label
                  key={off.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedOfficerId === off.id
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="officerSelection"
                    checked={selectedOfficerId === off.id}
                    onChange={() => setSelectedOfficerId(off.id)}
                    className="mt-1 h-3.5 w-3.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-grow">
                    <p className="font-bold text-slate-900">{off.rank} {off.fullName}</p>
                    <p className="text-slate-600 text-[11px]">Badge: {off.badgeNumber} · {off.policeStation}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Active Cases: <strong>{off.activeCasesCount}</strong> · Contact: {off.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition"
            >
              Assign Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
