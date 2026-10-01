import React, { useState } from 'react';
import { 
  FileText, PlusCircle, Search, Clock, CheckCircle2, AlertCircle, 
  FileCheck, Shield, MapPin, Calendar, ArrowRight, Printer, AlertTriangle
} from 'lucide-react';
import { FIR } from '../types';

interface CitizenPortalProps {
  firs: FIR[];
  userName: string;
  onOpenSubmitFir: () => void;
  onOpenTrackFir: (firNumber?: string) => void;
  onViewFirDetails: (fir: FIR) => void;
  onPrintAcknowledgement: (fir: FIR) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  firs,
  userName,
  onOpenSubmitFir,
  onOpenTrackFir,
  onViewFirDetails,
  onPrintAcknowledgement
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFirs = firs.filter(fir => {
    const matchesStatus = filterStatus === 'ALL' || fir.status === filterStatus;
    const matchesSearch = 
      fir.firNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fir.incidentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fir.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fir.incidentDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Verified':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Under Investigation':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Charge Sheet Filed':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Closed':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
            <Shield className="w-4 h-4" />
            <span>Digital Police Interface · Citizen Services Module</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome, {userName || 'Citizen'}
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Report cognizable incidents, obtain verifiable legal FIR receipts with digital QR verification, and monitor real-time investigation progress under the Bharatiya Nagarik Suraksha Sanhita (BNSS) & CrPC.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenSubmitFir}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs sm:text-sm shadow transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Lodge New e-FIR</span>
            </button>

            <button
              onClick={() => onOpenTrackFir()}
              className="px-5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white font-medium rounded-lg text-xs sm:text-sm border border-slate-600 shadow transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-semibold">My Filed FIRs</p>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{firs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total registered reports</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-semibold">Active Inquiries</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {firs.filter(f => f.status === 'Submitted' || f.status === 'Verified' || f.status === 'Under Investigation').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Pending / With Assigned IO</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-semibold">Court Charge Sheets</p>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {firs.filter(f => f.status === 'Charge Sheet Filed').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Forwarded to Magistrate</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-semibold">Resolved Cases</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {firs.filter(f => f.status === 'Closed').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Disposed / Investigation completed</p>
        </div>
      </div>

      {/* FIRs Registry & Tracker Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header & Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Registered FIR Docket</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review case progress, download official acknowledgement copies, or submit additional evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search FIR no, location..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Status Segmented Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
              {['ALL', 'Submitted', 'Under Investigation', 'Closed'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    filterStatus === st
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'ALL' ? 'All Records' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of FIRs */}
        {filteredFirs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No FIR records match your filter</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If you experienced a theft, fraud, assault, or cybercrime, click below to lodge a First Information Report.
            </p>
            <button
              onClick={onOpenSubmitFir}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg transition"
            >
              Lodge New FIR
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFirs.map(fir => (
              <div key={fir.id} className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  {/* Leading Title and Meta with quiet typographic separators (Zero Pill Discipline) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm tracking-tight">{fir.firNumber}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-xs font-semibold text-slate-700">{fir.categoryName}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-500">{fir.policeStation}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {fir.incidentDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Incident: {fir.incidentDate}</span>
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{fir.incidentLocation}</span>
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span>Legal: <strong className="text-slate-700">{fir.ipcSection}</strong></span>
                    {fir.assignedOfficerName && (
                      <>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span>IO: <strong className="text-slate-700">{fir.assignedOfficerRank} {fir.assignedOfficerName}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Status Indicator and Action Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                  {/* Clean unboxed status indicator */}
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded border ${getStatusColor(fir.status)}`}>
                    {fir.status}
                  </div>

                  <button
                    onClick={() => onPrintAcknowledgement(fir)}
                    title="Print FIR Acknowledgement Slip"
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Receipt</span>
                  </button>

                  <button
                    onClick={() => onViewFirDetails(fir)}
                    className="px-3 py-1.5 bg-[#0B132B] hover:bg-[#1C2541] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>View Case File</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Safety & Legal Advisory Notice */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="text-xs text-slate-700 space-y-1">
          <h4 className="font-bold text-slate-900">Legal Information on FIR Lodging (BNSS Sec 173 / CrPC Sec 154)</h4>
          <p className="leading-relaxed">
            Filing a false or malicious First Information Report is an offense punishable under Section 217 of Bharatiya Nyaya Sanhita (BNS) / Sec 182 IPC. Once an online FIR is registered, a copy of the report is immediately transmitted to the jurisdictional Police Station and the Judicial Magistrate.
          </p>
        </div>
      </div>
    </div>
  );
};
