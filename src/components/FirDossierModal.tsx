import React, { useState } from 'react';
import { 
  X, Shield, FileText, CheckCircle2, Clock, AlertTriangle, 
  User, MapPin, Calendar, Printer, UserCheck, Plus, Sparkles 
} from 'lucide-react';
import { FIR, FirStatus, FirStatusHistory, InvestigationUpdate, EvidenceItem } from '../types';

interface FirDossierModalProps {
  fir: FIR | null;
  statusHistories: FirStatusHistory[];
  investigationUpdates: InvestigationUpdate[];
  evidenceItems: EvidenceItem[];
  onClose: () => void;
  onUpdateStatus: (firId: number, newStatus: FirStatus, remarks: string) => void;
  onOpenAssignModal: (fir: FIR) => void;
  onOpenAddDiaryModal: (fir: FIR) => void;
  onPrintSlip: (fir: FIR) => void;
}

export const FirDossierModal: React.FC<FirDossierModalProps> = ({
  fir,
  statusHistories,
  investigationUpdates,
  evidenceItems,
  onClose,
  onUpdateStatus,
  onOpenAssignModal,
  onOpenAddDiaryModal,
  onPrintSlip
}) => {
  if (!fir) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'diary' | 'status'>('details');
  const [selectedNewStatus, setSelectedNewStatus] = useState<FirStatus>(fir.status);
  const [statusRemark, setStatusRemark] = useState('');

  const currentHistory = statusHistories.filter(h => h.firId === fir.id);
  const currentUpdates = investigationUpdates.filter(u => u.firId === fir.id);
  const currentEvidence = evidenceItems.filter(e => e.firId === fir.id);

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRemark.trim()) {
      alert('Please provide an official remark for the status transition audit.');
      return;
    }
    onUpdateStatus(fir.id, selectedNewStatus, statusRemark);
    setStatusRemark('');
    alert(`FIR status successfully updated to ${selectedNewStatus}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white font-mono">{fir.firNumber}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  {fir.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Jurisdiction: {fir.policeStation} ({fir.stationCode}) · District: {fir.incidentDistrict}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintSlip(fir)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'details' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Case File & Offense
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'evidence' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evidence Vault ({currentEvidence.length})
          </button>
          <button
            onClick={() => setActiveTab('diary')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'diary' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Case Diary Notes ({currentUpdates.length})
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'status' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Update Case Status
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6 text-xs">
          {/* TAB 1: DETAILS & OFFENSE */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Complainant & Incident Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-700">
                    Complainant Particulars
                  </h4>
                  <p className="font-bold text-slate-900 text-sm">{fir.complainantName}</p>
                  <p className="text-slate-600">Phone: {fir.complainantPhone}</p>
                  <p className="text-slate-600">Email: {fir.complainantEmail}</p>
                  <p className="text-slate-600">Govt ID: {fir.complainantAadhaar || 'Verified Citizen'}</p>
                  <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    Address: {fir.complainantAddress}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-700">
                    Investigating Officer Assignment
                  </h4>
                  {fir.assignedOfficerName ? (
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {fir.assignedOfficerRank} {fir.assignedOfficerName}
                      </p>
                      <p className="text-slate-600">Badge No: {fir.assignedOfficerBadge}</p>
                      <p className="text-slate-600">Contact: {fir.assignedOfficerPhone || '+91-98111-22233'}</p>
                      <div className="mt-3">
                        <button
                          onClick={() => onOpenAssignModal(fir)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-xs transition"
                        >
                          Reassign Officer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-rose-600 font-semibold mb-2">No Officer Assigned (Pending Action)</p>
                      <button
                        onClick={() => onOpenAssignModal(fir)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-bold text-xs transition"
                      >
                        + Assign Investigating Officer (IO)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal Sections & AI Breakdown */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold uppercase tracking-wider text-amber-400">
                      AI Legal Intelligence & Offense Head
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Model: TF-IDF + Naive Bayes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Classified Offense</p>
                    <p className="font-bold text-white text-xs mt-0.5">{fir.categoryName}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Indian Penal Code</p>
                    <p className="font-bold text-amber-300 text-xs mt-0.5 font-mono">{fir.ipcSection}</p>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400">Bharatiya Nyaya Sanhita</p>
                    <p className="font-bold text-slate-200 text-xs mt-0.5 font-mono">{fir.bnsSection}</p>
                  </div>
                </div>

                {fir.aiDuplicateSimilarityScore && fir.aiDuplicateSimilarityScore > 10 ? (
                  <div className="bg-rose-950/80 border border-rose-800 p-2.5 rounded-lg text-rose-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>
                      Similarity Engine Notice: Semantic overlap score of {fir.aiDuplicateSimilarityScore}% with prior station complaints.
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Accused & Stolen Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-700 mb-1">Accused Details ({fir.accusedType})</p>
                  <p className="text-slate-600">{fir.accusedDetails || 'Unidentified suspect.'}</p>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-700 mb-1">Stolen Property / Loss Particulars</p>
                  <p className="text-slate-600">{fir.stolenPropertyDetails || 'No specific property reported.'}</p>
                </div>
              </div>

              {/* Full Narrative */}
              <div>
                <p className="font-bold text-slate-700 mb-1">Recorded Incident Narrative:</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  "{fir.incidentDescription}"
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE VAULT */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Digital Evidence Repository</h4>
                  <p className="text-slate-500">Chain of custody documents and multimedia files logged for this FIR.</p>
                </div>
              </div>

              {currentEvidence.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  No evidence files attached to this case.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentEvidence.map(ev => (
                    <div key={ev.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{ev.originalName}</p>
                          <p className="text-[11px] text-slate-500">
                            Uploaded by {ev.uploadedByName} ({ev.uploadedByType}) · {(ev.fileSizeBytes / 1024).toFixed(0)} KB · {ev.uploadedAt}
                          </p>
                          <p className="text-slate-600 text-[11px] mt-0.5">{ev.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading evidence copy: ${ev.originalName}`)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded font-semibold text-xs transition"
                      >
                        Inspect File
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CASE DIARY NOTES */}
          {activeTab === 'diary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">General Diary & Case Diary (CD) Entries</h4>
                  <p className="text-slate-500">Chronological investigative progress recorded under Section 193 BNSS.</p>
                </div>
                <button
                  onClick={() => onOpenAddDiaryModal(fir)}
                  className="px-3 py-1.5 bg-[#0B132B] hover:bg-[#1C2541] text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Case Diary Entry</span>
                </button>
              </div>

              {currentUpdates.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  No case diary entries added yet. Click above to record investigative findings.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentUpdates.map(u => (
                    <div key={u.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-slate-900 text-xs">
                          Diary Ref: {u.diaryEntryNumber}
                        </span>
                        <span className="text-slate-400 text-[10px]">{u.recordedAt}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">{u.findings}</p>
                      {u.nextActionPlan && (
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-200 text-[11px]">
                          <strong>Next Action:</strong> {u.nextActionPlan}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Recorded by {u.officerRank} {u.officerName} (Badge: {u.badgeNumber})
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: UPDATE STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Change Official Case Status</h4>
                <p className="text-slate-500">
                  Update investigation disposition with mandatory audit trail remarks.
                </p>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Case Status *</label>
                  <select
                    value={selectedNewStatus}
                    onChange={e => setSelectedNewStatus(e.target.value as FirStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Submitted">Submitted (Pending IO)</option>
                    <option value="Verified">Verified</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Charge Sheet Filed">Charge Sheet Filed (Sent to Court)</option>
                    <option value="Closed">Closed / Disposed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Transition Remarks *</label>
                  <textarea
                    rows={3}
                    value={statusRemark}
                    onChange={e => setStatusRemark(e.target.value)}
                    required
                    placeholder="Provide justification and investigative reasons for this status change..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition"
                >
                  Commit Status Update
                </button>
              </form>

              {/* Status Audit History */}
              <div className="pt-4 border-t border-slate-200">
                <h5 className="font-bold text-slate-800 mb-3 text-xs">Immutable Audit History</h5>
                <div className="space-y-2">
                  {currentHistory.map(h => (
                    <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">{h.newStatus}</span>
                        <span className="text-slate-400 text-[10px] ml-2">{h.changedAt}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">{h.remarks}</p>
                        <p className="text-slate-400 text-[10px]">Action by: {h.changedByName} ({h.changedByRole})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
