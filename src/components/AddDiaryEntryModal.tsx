import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { FIR, InvestigationUpdate } from '../types';

interface AddDiaryEntryModalProps {
  fir: FIR | null;
  isOpen: boolean;
  onClose: () => void;
  onAddUpdate: (firId: number, update: InvestigationUpdate) => void;
  currentOfficerName: string;
  currentOfficerRank: string;
}

export const AddDiaryEntryModal: React.FC<AddDiaryEntryModalProps> = ({
  fir,
  isOpen,
  onClose,
  onAddUpdate,
  currentOfficerName,
  currentOfficerRank
}) => {
  if (!isOpen || !fir) return null;

  const [findings, setFindings] = useState('');
  const [nextActionPlan, setNextActionPlan] = useState('');
  const [witnessStatements, setWitnessStatements] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findings.trim()) {
      alert('Please provide investigative findings.');
      return;
    }

    const newUpdate: InvestigationUpdate = {
      id: Date.now(),
      firId: fir.id,
      officerId: 101,
      officerName: currentOfficerName,
      officerRank: currentOfficerRank,
      badgeNumber: 'POL-DL-8842',
      diaryEntryNumber: `CD-${fir.stationCode}-${Date.now().toString().slice(-4)}`,
      findings,
      nextActionPlan,
      witnessStatements,
      isConfidential,
      recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    onAddUpdate(fir.id, newUpdate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0B132B] text-white p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Record Case Diary / General Diary Entry</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 font-mono">{fir.firNumber}</p>
            <p className="text-slate-600 mt-0.5">Recording Officer: {currentOfficerRank} {currentOfficerName}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Case Diary Findings & Investigation Narrative *
            </label>
            <textarea
              rows={4}
              value={findings}
              onChange={e => setFindings(e.target.value)}
              required
              placeholder="Record forensic reports, suspect interrogations, CCTV reviews, CDR analysis, seizure memos..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Action Plan / Immediate Direction
            </label>
            <input
              type="text"
              value={nextActionPlan}
              onChange={e => setNextActionPlan(e.target.value)}
              placeholder="e.g. Issue Section 91 CrPC notice to bank; summon witness"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Witness Statements Recorded (Optional)
            </label>
            <textarea
              rows={2}
              value={witnessStatements}
              onChange={e => setWitnessStatements(e.target.value)}
              placeholder="Key testimony from eyewitnesses or informant..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={e => setIsConfidential(e.target.checked)}
              className="h-3.5 w-3.5 text-amber-600 rounded"
            />
            <span className="text-slate-700 font-medium text-[11px]">
              Mark as Confidential (Internal police inquiry note, hidden from citizen public tracking)
            </span>
          </label>

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
              Save Diary Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
