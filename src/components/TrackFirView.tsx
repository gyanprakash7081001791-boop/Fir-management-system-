import React, { useState } from 'react';
import { 
  Search, Shield, CheckCircle2, Clock, FileCheck, AlertCircle, 
  User, Phone, MapPin, Calendar, FileText, ArrowRight, Printer 
} from 'lucide-react';
import { FIR, FirStatusHistory, InvestigationUpdate } from '../types';

interface TrackFirViewProps {
  firs: FIR[];
  statusHistories: FirStatusHistory[];
  investigationUpdates: InvestigationUpdate[];
  initialFirNumber?: string;
  onViewFullDossier: (fir: FIR) => void;
  onPrintSlip: (fir: FIR) => void;
}

export const TrackFirView: React.FC<TrackFirViewProps> = ({
  firs,
  statusHistories,
  investigationUpdates,
  initialFirNumber,
  onViewFullDossier,
  onPrintSlip
}) => {
  const [query, setQuery] = useState(initialFirNumber || (firs[0]?.firNumber || ''));
  const [selectedFir, setSelectedFir] = useState<FIR | null>(
    initialFirNumber 
      ? firs.find(f => f.firNumber.toLowerCase() === initialFirNumber.toLowerCase()) || firs[0]
      : firs[0] || null
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matched = firs.find(
      f => f.firNumber.toLowerCase().includes(query.trim().toLowerCase()) ||
           f.complainantPhone.includes(query.trim())
    );

    if (matched) {
      setSelectedFir(matched);
    } else {
      alert(`No FIR record found matching "${query}". Please check the registration number.`);
    }
  };

  const stages = [
    { key: 'Submitted', label: '1. Lodged Online', desc: 'Complaint registered' },
    { key: 'Verified', label: '2. Preliminary Verification', desc: 'Jurisdiction & ID confirmed' },
    { key: 'Under Investigation', label: '3. Investigation Active', desc: 'IO assigned & evidence gathered' },
    { key: 'Charge Sheet Filed', label: '4. Judicial Filing', desc: 'Report submitted to Court' },
    { key: 'Closed', label: '5. Case Closed', desc: 'Final disposition' }
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Verified': return 1;
      case 'Under Investigation': return 2;
      case 'Charge Sheet Filed': return 3;
      case 'Closed': return 4;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const activeIndex = selectedFir ? getStageIndex(selectedFir.status) : 0;
  const currentHistory = selectedFir ? statusHistories.filter(h => h.firId === selectedFir.id) : [];
  const currentUpdates = selectedFir ? investigationUpdates.filter(u => u.firId === selectedFir.id && !u.isConfidential) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Bar Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
            <Shield className="w-4 h-4" />
            <span>Real-Time Case Tracking System (CCTNS)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Track First Information Report (FIR) Status</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your unique FIR Number or registered mobile number to check the live investigation status and milestones.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. FIR/DL-CP/2026/0104 or 9876543210"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition shadow flex items-center justify-center gap-2"
          >
            <span>Search Case</span>
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="flex items-center gap-2 flex-wrap pt-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Quick Test Cases:</span>
          {firs.slice(0, 3).map(f => (
            <button
              key={f.id}
              onClick={() => {
                setQuery(f.firNumber);
                setSelectedFir(f);
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition"
            >
              {f.firNumber}
            </button>
          ))}
        </div>
      </div>

      {selectedFir ? (
        <div className="space-y-6">
          {/* Main Case Snapshot Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {selectedFir.firNumber}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded">
                    {selectedFir.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Station: <strong>{selectedFir.policeStation}</strong> ({selectedFir.stationCode}) · Registered on {selectedFir.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintSlip(selectedFir)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Acknowledgement Slip</span>
                </button>
                <button
                  onClick={() => onViewFullDossier(selectedFir)}
                  className="px-3.5 py-2 bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <span>Full Case File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5-STAGE PROGRESS TRACKER */}
            <div className="py-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                Statutory Investigation Lifecycle
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {stages.map((st, idx) => {
                  const isCompleted = activeIndex >= idx && activeIndex !== -1;
                  const isCurrent = activeIndex === idx;

                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-amber-600 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {isCurrent && <Clock className="w-4 h-4 text-amber-600 animate-spin" />}
                      </div>

                      <p className={`font-bold ${isCurrent ? 'text-amber-900' : isCompleted ? 'text-emerald-900' : 'text-slate-600'}`}>
                        {st.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Complainant Details</span>
                <p className="font-bold text-slate-900 text-sm">{selectedFir.complainantName}</p>
                <p className="text-slate-600">{selectedFir.complainantPhone}</p>
                <p className="text-slate-500 text-[11px] mt-1">{selectedFir.complainantAddress}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Offense & Legal Sections</span>
                <p className="font-bold text-slate-900 text-sm">{selectedFir.categoryName}</p>
                <p className="text-amber-700 font-mono font-semibold">{selectedFir.ipcSection}</p>
                <p className="text-slate-500 text-[11px] font-mono">{selectedFir.bnsSection}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Investigating Officer</span>
                {selectedFir.assignedOfficerName ? (
                  <>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedFir.assignedOfficerRank} {selectedFir.assignedOfficerName}
                    </p>
                    <p className="text-slate-600">Badge: {selectedFir.assignedOfficerBadge}</p>
                    <p className="text-slate-500 text-[11px]">Contact: {selectedFir.assignedOfficerPhone || '+91-98111-22233'}</p>
                  </>
                ) : (
                  <p className="text-amber-700 font-medium">Pending Assignment by Station In-Charge</p>
                )}
              </div>
            </div>

            {/* Incident Narrative Summary */}
            <div className="pt-2 text-xs">
              <span className="font-semibold text-slate-700">Incident Narrative:</span>
              <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                "{selectedFir.incidentDescription}"
              </p>
            </div>
          </div>

          {/* Investigation Updates & Diary Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Public Case Updates & Milestones</span>
            </h3>

            {currentUpdates.length === 0 && currentHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No formal case updates published yet.</p>
            ) : (
              <div className="space-y-3">
                {currentUpdates.map(u => (
                  <div key={u.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        Entry: {u.diaryEntryNumber}
                      </span>
                      <span className="text-slate-400 text-[10px]">{u.recordedAt}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{u.findings}</p>
                    {u.nextActionPlan && (
                      <p className="text-slate-500 text-[11px]">
                        <strong>Next Milestone:</strong> {u.nextActionPlan}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Recorded by: {u.officerRank} {u.officerName} ({u.badgeNumber})
                    </p>
                  </div>
                ))}

                {/* Audit transitions */}
                {currentHistory.map(h => (
                  <div key={h.id} className="p-2.5 bg-white border border-slate-100 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Status updated to {h.newStatus}</span>
                      <span className="text-slate-400 text-[10px] ml-2">{h.changedAt}</span>
                      {h.remarks && <p className="text-slate-500 text-[11px] mt-0.5">{h.remarks}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Please search for an FIR record above.</p>
        </div>
      )}
    </div>
  );
};
