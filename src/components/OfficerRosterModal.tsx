import React, { useState } from 'react';
import { X, Users, Plus, Shield, CheckCircle } from 'lucide-react';
import { PoliceOfficer } from '../types';

interface OfficerRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: PoliceOfficer[];
  onAddOfficer: (officer: PoliceOfficer) => void;
}

export const OfficerRosterModal: React.FC<OfficerRosterModalProps> = ({
  isOpen,
  onClose,
  officers,
  onAddOfficer
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState(`POL-DL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [rank, setRank] = useState<PoliceOfficer['rank']>('Sub-Inspector');
  const [policeStation, setPoliceStation] = useState('Connaught Place Police Station');
  const [phone, setPhone] = useState('+91-98777-66554');
  const [email, setEmail] = useState('');

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !badgeNumber) return;

    const newOff: PoliceOfficer = {
      id: Date.now(),
      badgeNumber,
      fullName,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@police.gov.in`,
      phone,
      rank,
      policeStation,
      stationCode: policeStation.includes('Cyber') ? 'CYBER-HQ-01' : 'PS-CP-01',
      district: 'New Delhi',
      state: 'Delhi',
      activeCasesCount: 0
    };

    onAddOfficer(newOff);
    setIsAdding(false);
    setFullName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#0B132B] text-white p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Police Officers Directory & Roster</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Active Investigating Officers ({officers.length}) enrolled in jurisdictional division.
            </p>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : 'Enroll Officer'}</span>
            </button>
          </div>

          {/* Add Officer Form */}
          {isAdding && (
            <form onSubmit={handleEnroll} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-slate-900">Enroll New Police Official</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Inspector R. S. Negi"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Badge Number *</label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={e => setBadgeNumber(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rank *</label>
                  <select
                    value={rank}
                    onChange={e => setRank(e.target.value as PoliceOfficer['rank'])}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="Sub-Inspector">Sub-Inspector (SI)</option>
                    <option value="Inspector">Inspector (SHO)</option>
                    <option value="Assistant Sub-Inspector">Assistant Sub-Inspector (ASI)</option>
                    <option value="Deputy Superintendent of Police">Deputy Superintendent of Police (DSP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded text-xs"
                >
                  Save Officer
                </button>
              </div>
            </form>
          )}

          {/* Officers List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {officers.map(off => (
              <div key={off.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{off.rank} {off.fullName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Badge: {off.badgeNumber} · {off.policeStation}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Phone: {off.phone} · Email: {off.email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold text-[10px]">
                    {off.activeCasesCount} Active Cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
