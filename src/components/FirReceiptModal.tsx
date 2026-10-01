import React from 'react';
import { X, Printer, Shield, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { FIR } from '../types';

interface FirReceiptModalProps {
  fir: FIR | null;
  onClose: () => void;
}

export const FirReceiptModal: React.FC<FirReceiptModalProps> = ({ fir, onClose }) => {
  if (!fir) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-[#0B132B] text-white p-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-white">Official FIR Acknowledgement Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-fir-slip" className="p-8 overflow-y-auto bg-white text-slate-900 font-serif space-y-6">
          {/* Official Department Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="w-12 h-12 mx-auto mb-2 text-slate-900 flex items-center justify-center border-2 border-slate-900 rounded-full font-sans font-extrabold text-lg">
              POLICE
            </div>
            <h2 className="text-lg font-extrabold tracking-wide uppercase">
              STATE POLICE DEPARTMENT · CCTNS NATIONAL NETWORK
            </h2>
            <h3 className="text-sm font-semibold tracking-wider text-slate-700">
              FIRST INFORMATION REPORT (e-FIR) ACKNOWLEDGEMENT
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-1">
              [Recorded under Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 / Section 154 CrPC]
            </p>
          </div>

          {/* FIR Registration & Barcode Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-sans bg-slate-50 p-4 border border-slate-300 rounded-lg">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">FIR Registration Number</p>
              <p className="text-lg font-extrabold text-slate-900 tracking-wider font-mono">{fir.firNumber}</p>
              <p className="text-xs text-slate-600 mt-0.5">Station: {fir.policeStation} ({fir.stationCode})</p>
            </div>

            {/* Verification Barcode & QR Simulation */}
            <div className="text-right flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="h-8 w-36 bg-slate-900 flex items-center justify-center text-white text-[10px] tracking-widest font-mono">
                  ||||| | |||| |||| ||
                </div>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">UID: {fir.firNumber.replace(/\//g, '-')}</p>
              </div>

              {/* QR Code Graphic */}
              <div className="w-14 h-14 border border-slate-300 bg-white p-1 rounded flex flex-col items-center justify-center">
                <div className="w-full h-full bg-slate-900/90 flex items-center justify-center text-[8px] text-white font-mono text-center p-0.5 leading-tight">
                  QR VERIFIED CCTNS
                </div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="border border-slate-300 text-xs font-sans">
            <div className="grid grid-cols-3 border-b border-slate-300 bg-slate-100 p-2 font-bold text-slate-800">
              <div>FIELD</div>
              <div className="col-span-2">RECORDED PARTICULARS</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Complainant Name:</div>
              <div className="col-span-2 font-bold text-slate-900">{fir.complainantName}</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Contact & Address:</div>
              <div className="col-span-2 text-slate-800">
                {fir.complainantPhone} · {fir.complainantEmail} <br />
                {fir.complainantAddress}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Date & Time of Occurrence:</div>
              <div className="col-span-2 text-slate-800">{fir.incidentDate}</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Place of Occurrence:</div>
              <div className="col-span-2 text-slate-800">{fir.incidentLocation} ({fir.incidentDistrict})</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Offense Classification:</div>
              <div className="col-span-2 text-slate-900 font-bold">{fir.categoryName}</div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Legal Sections Invoked:</div>
              <div className="col-span-2 text-amber-900 font-bold font-mono">
                {fir.ipcSection} | {fir.bnsSection}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Accused / Suspects:</div>
              <div className="col-span-2 text-slate-800">
                <span className="font-bold">{fir.accusedType}:</span> {fir.accusedDetails || 'Not specified at registration'}
              </div>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-200 p-2.5">
              <div className="font-semibold text-slate-600">Property / Monetary Loss:</div>
              <div className="col-span-2 text-slate-800">{fir.stolenPropertyDetails || 'Nil'}</div>
            </div>

            <div className="grid grid-cols-3 p-2.5">
              <div className="font-semibold text-slate-600">Incident Narrative:</div>
              <div className="col-span-2 text-slate-800 italic leading-relaxed">
                "{fir.incidentDescription}"
              </div>
            </div>
          </div>

          {/* Legal Certification & Stamp Section */}
          <div className="grid grid-cols-2 pt-6 border-t border-slate-300 font-sans text-xs">
            <div>
              <p className="text-slate-500">Lodged At / Recorded By:</p>
              <p className="font-bold text-slate-900 mt-1">CCTNS Automated Digital Ingestion</p>
              <p className="text-[11px] text-slate-500">Timestamp: {fir.createdAt} IST</p>

              <div className="mt-4 inline-block border-2 border-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                DIGITALLY VERIFIED · OFFICIAL SEAL
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="h-10"></div>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 inline-block min-w-[180px]">
                Station Duty Officer / SHO
              </p>
              <p className="text-[11px] text-slate-500">{fir.policeStation}</p>
            </div>
          </div>

          {/* Statutory Note */}
          <div className="bg-slate-50 p-3 border border-slate-200 text-[10px] text-slate-500 font-sans leading-relaxed">
            Note: This acknowledgement serves as legal proof of receipt of information under Section 173(2) BNSS. A free copy of the FIR must be provided to the informant forthwith under statutory rules.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
