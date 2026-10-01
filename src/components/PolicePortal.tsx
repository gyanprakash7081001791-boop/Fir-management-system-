import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, Users, FileText, CheckCircle2, Clock, 
  Search, Filter, Plus, ArrowUpRight, ChevronRight, BarChart3, 
  Download, Printer, UserCheck, ShieldAlert
} from 'lucide-react';
import { FIR, PoliceOfficer, User, CrimeCategory } from '../types';

interface PolicePortalProps {
  firs: FIR[];
  officers: PoliceOfficer[];
  users: User[];
  categories: CrimeCategory[];
  currentOfficerName: string;
  currentOfficerRank: string;
  onOpenFirDossier: (fir: FIR) => void;
  onOpenAssignModal: (fir: FIR) => void;
  onOpenAddDiaryModal: (fir: FIR) => void;
  onOpenRosterModal: () => void;
  onExportReport: () => void;
}

export const PolicePortal: React.FC<PolicePortalProps> = ({
  firs,
  officers,
  users,
  categories,
  currentOfficerName,
  currentOfficerRank,
  onOpenFirDossier,
  onOpenAssignModal,
  onOpenAddDiaryModal,
  onOpenRosterModal,
  onExportReport
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'registry' | 'analytics' | 'officers'>('registry');

  // Metrics
  const totalFirs = firs.length;
  const pendingFirs = firs.filter(f => f.status === 'Submitted').length;
  const underInvestigationFirs = firs.filter(f => f.status === 'Verified' || f.status === 'Under Investigation').length;
  const chargeSheetFirs = firs.filter(f => f.status === 'Charge Sheet Filed').length;
  const closedFirs = firs.filter(f => f.status === 'Closed').length;

  // Filtered FIRs
  const filteredFirs = firs.filter(f => {
    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || f.categoryName === selectedCategory;
    const matchesStation = selectedStation === 'ALL' || f.policeStation.includes(selectedStation);
    const matchesSearch = 
      f.firNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.incidentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.incidentDescription.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesStation && matchesSearch;
  });

  // Calculate crime distribution
  const categoryCounts: Record<string, number> = {};
  firs.forEach(f => {
    categoryCounts[f.categoryName] = (categoryCounts[f.categoryName] || 0) + 1;
  });

  // Check for any potential duplicates in the system
  const duplicatesFlagged = firs.filter(f => (f.aiDuplicateSimilarityScore || 0) >= 30);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'Verified':
        return 'text-blue-800 bg-blue-50 border-blue-300';
      case 'Under Investigation':
        return 'text-indigo-800 bg-indigo-50 border-indigo-300';
      case 'Charge Sheet Filed':
        return 'text-purple-800 bg-purple-50 border-purple-300';
      case 'Closed':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300';
      case 'Rejected':
        return 'text-rose-800 bg-rose-50 border-rose-300';
      default:
        return 'text-slate-800 bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Command Header */}
      <div className="bg-[#0B132B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Central Police Command & Investigation Bureau · HQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Law Enforcement Crime Docket
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Logged In As: <strong className="text-white">{currentOfficerRank} {currentOfficerName}</strong> · Station: Connaught Place Central Police Division
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenRosterModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs border border-slate-700 shadow-sm transition flex items-center gap-2"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Officers ({officers.length})</span>
          </button>

          <button
            onClick={onExportReport}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export FIR Report</span>
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Total FIRs Lodged</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalFirs}</p>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">All Jurisdiction Records</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Pending Verification</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">{pendingFirs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Requires IO Assignment</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Under Investigation</p>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{underInvestigationFirs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active Case Dockets</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Charge Sheet Filed</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{chargeSheetFirs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Magistrate Submissions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[11px] text-slate-500 uppercase font-semibold">Disposed / Closed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{closedFirs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Resolved or Final Report</p>
        </div>
      </div>

      {/* AI SERIAL OFFENSE & DUPLICATE INTELLIGENCE BANNER */}
      {duplicatesFlagged.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                AI Crime Intelligence Alert: Potential Modus Operandi Pattern / Multi-Complaint Similarity
              </h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                The NLP similarity engine flagged <strong>{duplicatesFlagged.length} case(s)</strong> sharing high semantic overlap in descriptions (e.g. UPI KYC cyber scams or metro pickpocketing ring). Inspect these dossiers to coordinate multi-station task forces.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedStatus('ALL');
              setSearchQuery('cyber');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap transition"
          >
            Review Flagged
          </button>
        </div>
      )}

      {/* Sub-Tabs: Registry vs Crime Analytics */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('registry')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${
            activeTab === 'registry'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Master FIR Registry ({firs.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 font-semibold px-2 border-b-2 transition ${
            activeTab === 'analytics'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Crime Analytics & Statistics
        </button>
      </div>

      {/* TAB 1: MASTER FIR REGISTRY */}
      {activeTab === 'registry' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search FIR, complainant, place..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Submitted">Submitted (Pending IO)</option>
                <option value="Verified">Verified</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Charge Sheet Filed">Charge Sheet Filed</option>
                <option value="Closed">Closed / Disposed</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Crime Category Filter */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none max-w-xs truncate"
              >
                <option value="ALL">All Crime Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500">
              Showing <strong>{filteredFirs.length}</strong> of {totalFirs} cases
            </span>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">FIR Number & Station</th>
                  <th className="px-4 py-3">Complainant</th>
                  <th className="px-4 py-3">Crime Head & Legal Sections</th>
                  <th className="px-4 py-3">Assigned IO</th>
                  <th className="px-4 py-3">AI Prediction & Match</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFirs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No FIR cases match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFirs.map(fir => (
                    <tr key={fir.id} className="hover:bg-slate-50/80 transition">
                      {/* FIR No & Station */}
                      <td className="px-4 py-3 font-medium">
                        <div className="font-mono font-bold text-slate-900 text-xs">{fir.firNumber}</div>
                        <div className="text-[11px] text-slate-500">{fir.policeStation}</div>
                        <div className="text-[10px] text-slate-400">{fir.incidentDate}</div>
                      </td>

                      {/* Complainant */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{fir.complainantName}</div>
                        <div className="text-[11px] text-slate-500">{fir.complainantPhone}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{fir.incidentLocation}</div>
                      </td>

                      {/* Crime Head & Sections */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{fir.categoryName}</div>
                        <div className="text-amber-800 font-mono text-[10px]">{fir.ipcSection}</div>
                        <div className="text-slate-400 font-mono text-[9px]">{fir.bnsSection}</div>
                      </td>

                      {/* Assigned IO */}
                      <td className="px-4 py-3">
                        {fir.assignedOfficerName ? (
                          <div>
                            <div className="font-medium text-slate-900">{fir.assignedOfficerRank} {fir.assignedOfficerName}</div>
                            <div className="text-[10px] text-slate-500">Badge: {fir.assignedOfficerBadge}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenAssignModal(fir)}
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded font-semibold text-[11px] transition"
                          >
                            + Assign IO
                          </button>
                        )}
                      </td>

                      {/* AI Prediction & Confidence */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 text-[11px]">{fir.aiPredictedCategory}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Confidence: <strong className="text-amber-700">{fir.aiConfidenceScore || 92}%</strong>
                          {(fir.aiDuplicateSimilarityScore || 0) > 10 && (
                            <span className="ml-1.5 text-rose-600">({fir.aiDuplicateSimilarityScore}% match)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[11px] font-semibold rounded border ${getStatusBadge(fir.status)}`}>
                          {fir.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenAddDiaryModal(fir)}
                            title="Add Case Diary Entry"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenAssignModal(fir)}
                            title="Assign / Reassign Officer"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenFirDossier(fir)}
                            className="px-2.5 py-1 bg-[#0B132B] hover:bg-[#1C2541] text-white rounded font-medium text-xs transition"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CRIME ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crime Category Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Offense Classification Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of registered complaints by Crime Head</p>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = ((count / totalFirs) * 100).toFixed(0);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800">{cat}</span>
                      <span className="text-slate-600">{count} FIRs ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Investigation Clearance Ratio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Disposal & Clearance Rate</h3>
              <p className="text-xs text-slate-500">Judicial charge-sheet vs open investigations</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <p className="text-xs text-emerald-800 font-semibold">Clearance Rate</p>
                <p className="text-3xl font-extrabold text-emerald-900 mt-1">
                  {(((chargeSheetFirs + closedFirs) / (totalFirs || 1)) * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-emerald-700 mt-1">Charge-sheeted + Closed</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-xs text-amber-800 font-semibold">Active Caseload</p>
                <p className="text-3xl font-extrabold text-amber-900 mt-1">
                  {underInvestigationFirs + pendingFirs}
                </p>
                <p className="text-[10px] text-amber-700 mt-1">In progress across IOs</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-900">Standard Police Investigation SLAs (BNSS Guidelines)</h4>
              <p className="text-slate-600 leading-relaxed">
                Section 193 BNSS mandates completion of investigation without unnecessary delay. For offenses punishable with imprisonment up to 10 years, charge sheets must be filed within 60 days of FIR registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
