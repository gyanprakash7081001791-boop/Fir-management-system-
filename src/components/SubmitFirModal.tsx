import React, { useState, useId } from 'react';
import { 
  X, Shield, Sparkles, AlertTriangle, Upload, CheckCircle2, 
  HelpCircle, ArrowRight, ArrowLeft, FileText, UserCheck, MapPin
} from 'lucide-react';
import { CrimeCategory, FIR, EvidenceItem, PriorityLevel } from '../types';
import { classifyIncidentLive, detectDuplicateFIR } from '../utils/aiClassifier';

interface SubmitFirModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CrimeCategory[];
  existingFirs: FIR[];
  currentUserId: number;
  currentUserName: string;
  currentUserPhone: string;
  currentUserEmail: string;
  onFirSubmitted: (newFir: FIR, newEvidence: EvidenceItem[]) => void;
}

export const SubmitFirModal: React.FC<SubmitFirModalProps> = ({
  isOpen,
  onClose,
  categories,
  existingFirs,
  currentUserId,
  currentUserName,
  currentUserPhone,
  currentUserEmail,
  onFirSubmitted
}) => {
  const [step, setStep] = useState<number>(1); // 1: Complainant, 2: Incident & AI, 3: Suspect & Evidence, 4: Review

  // Complainant state
  const [complainantName, setComplainantName] = useState(currentUserName || 'Rajesh Kumar Verma');
  const [complainantPhone, setComplainantPhone] = useState(currentUserPhone || '9876543210');
  const [complainantEmail, setComplainantEmail] = useState(currentUserEmail || 'rajesh.kumar@example.com');
  const [complainantAadhaar, setComplainantAadhaar] = useState('XXXX-XXXX-4589');
  const [complainantAddress, setComplainantAddress] = useState('Flat 402, Shanti Heights, Sector 18, New Delhi');

  // Incident state
  const [incidentDate, setIncidentDate] = useState('2026-10-01T14:30');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [policeStation, setPoliceStation] = useState('Connaught Place Police Station');
  const [stationCode, setStationCode] = useState('PS-CP-01');
  const [incidentDistrict, setIncidentDistrict] = useState('New Delhi');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');

  // Crime narrative & AI
  const [incidentDescription, setIncidentDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [hasUserOverriddenAi, setHasUserOverriddenAi] = useState(false);

  // Accused & property
  const [accusedType, setAccusedType] = useState<'Known' | 'Unknown' | 'Suspected'>('Unknown');
  const [accusedDetails, setAccusedDetails] = useState('');
  const [stolenPropertyDetails, setStolenPropertyDetails] = useState('');

  // Evidence state
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [digitalDeclaration, setDigitalDeclaration] = useState(false);

  // Live AI classification & duplicate detection
  const aiResult = classifyIncidentLive(incidentDescription);
  const duplicateResult = detectDuplicateFIR(incidentDescription, existingFirs);

  // Synchronize category if not overridden
  const handleDescriptionChange = (text: string) => {
    setIncidentDescription(text);
    if (!hasUserOverriddenAi && text.length > 15) {
      const pred = classifyIncidentLive(text);
      const matched = categories.find(c => c.name.toLowerCase() === pred.category.toLowerCase());
      if (matched) {
        setSelectedCategoryId(matched.id);
      }
    }
  };

  const handleManualCategorySelect = (id: number) => {
    setSelectedCategoryId(id);
    setHasUserOverriddenAi(true);
  };

  const handleAddSampleEvidence = () => {
    const sampleFiles = [
      { name: 'CCTV_Snapshot_Frame_01.jpg', size: 1450000, type: 'image/jpeg' },
      { name: 'Bank_Statement_UPI_Reference.pdf', size: 380000, type: 'application/pdf' },
      { name: 'Call_Recording_Transcript.pdf', size: 210000, type: 'application/pdf' }
    ];
    const next = sampleFiles[evidenceFiles.length % sampleFiles.length];
    setEvidenceFiles([...evidenceFiles, next]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!digitalDeclaration) {
      alert('Please confirm the legal declaration before submitting the FIR.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const uniqueNumber = `FIR/DL-CP/${currentYear}/0${Math.floor(100 + Math.random() * 900)}`;

    const currentCat = categories.find(c => c.id === selectedCategoryId) || categories[0];

    const newFir: FIR = {
      id: Date.now(),
      firNumber: uniqueNumber,
      userId: currentUserId || 1,
      complainantName,
      complainantPhone,
      complainantEmail,
      complainantAddress,
      complainantAadhaar,
      categoryId: selectedCategoryId,
      categoryName: currentCat.name,
      ipcSection: currentCat.ipcSection,
      bnsSection: currentCat.bnsSection,
      incidentDate: incidentDate.replace('T', ' '),
      incidentLocation: incidentLocation || 'Connaught Place Central Market',
      incidentDistrict,
      policeStation,
      stationCode,
      incidentDescription,
      accusedType,
      accusedDetails: accusedDetails || 'No specific suspect identified at filing.',
      stolenPropertyDetails: stolenPropertyDetails || 'None reported.',
      priority,
      status: 'Submitted',
      assignedOfficerId: null,
      assignedOfficerName: null,
      aiPredictedCategory: aiResult.category,
      aiConfidenceScore: aiResult.confidence,
      aiPotentialDuplicateFirId: duplicateResult.isDuplicate && duplicateResult.matchedFir ? duplicateResult.matchedFir.id : null,
      aiDuplicateSimilarityScore: duplicateResult.similarityScore,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      evidenceCount: evidenceFiles.length
    };

    const evidenceItems: EvidenceItem[] = evidenceFiles.map((f, idx) => ({
      id: Date.now() + idx,
      firId: newFir.id,
      fileName: f.name,
      originalName: f.name,
      fileType: f.type,
      fileSizeBytes: f.size,
      description: 'Supporting documentation uploaded by complainant at time of lodging e-FIR.',
      uploadedByType: 'Citizen',
      uploadedByName: complainantName,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));

    onFirSubmitted(newFir, evidenceItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0B132B] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Lodge Online First Information Report (e-FIR)</h3>
              <p className="text-xs text-slate-400">
                Official Law Enforcement Complaint Docket · CCTNS Standard Format
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Complainant</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Incident & AI</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Suspect & Evidence</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200"></div>
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-amber-700 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span>Declaration</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* STEP 1: COMPLAINANT DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Step 1: Complainant Identification</h4>
                <p className="text-xs text-slate-500">Provide legal details as per Government Identity Proof.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={e => setComplainantName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (OTP Verified) *</label>
                  <input
                    type="tel"
                    value={complainantPhone}
                    onChange={e => setComplainantPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="10-digit mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={complainantEmail}
                    onChange={e => setComplainantEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhaar / Govt ID Reference</label>
                  <input
                    type="text"
                    value={complainantAadhaar}
                    onChange={e => setComplainantAadhaar(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    placeholder="XXXX-XXXX-1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address *</label>
                <textarea
                  rows={2}
                  value={complainantAddress}
                  onChange={e => setComplainantAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Permanent residential address..."
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Complainant profile verified via State Citizen Directory. Official communications will be routed to this contact.</span>
              </div>
            </div>
          )}

          {/* STEP 2: INCIDENT DETAILS & AI CLASSIFICATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Step 2: Incident Details & Real-Time AI Analysis</h4>
                <p className="text-xs text-slate-500">
                  Describe what happened in detail. Our AI assistant will automatically classify the penal sections and check for duplicate complaints.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date & Time of Occurrence *</label>
                  <input
                    type="datetime-local"
                    value={incidentDate}
                    onChange={e => setIncidentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jurisdictional Police Station *</label>
                  <select
                    value={policeStation}
                    onChange={e => {
                      setPoliceStation(e.target.value);
                      if (e.target.value.includes('Cyber')) {
                        setStationCode('CYBER-HQ-01');
                      } else {
                        setStationCode('PS-CP-01');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Connaught Place Police Station">Connaught Place Police Station (PS-CP-01)</option>
                    <option value="Cyber Crime Investigation Cell">Cyber Crime Investigation Cell (CYBER-HQ-01)</option>
                    <option value="Indiranagar Police Station">Indiranagar Police Station (PS-INDR-04)</option>
                    <option value="Central Railway Police Station">Central Railway Police Station (GRP-DL-02)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Place of Occurrence (PoO) / Address *</label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={e => setIncidentLocation(e.target.value)}
                  required
                  placeholder="e.g. Metro Gate 3, Inner Circle, Near Bank of Baroda"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Incident Description (Detailed Chronological Narrative) *
                  </label>
                  <span className="text-[11px] text-slate-400">Min 20 characters</span>
                </div>
                <textarea
                  rows={4}
                  value={incidentDescription}
                  onChange={e => handleDescriptionChange(e.target.value)}
                  required
                  placeholder="Explain exactly what happened, dates, weapons/methods used, electronic devices, financial amounts, or how the incident occurred..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* LIVE AI SMART ASSISTANT PANEL */}
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Crime Classification & Intelligence</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Decision Support Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <p className="text-[11px] text-slate-400">AI Predicted Category</p>
                    <p className="font-bold text-white mt-0.5">{aiResult.category}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-grow bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${aiResult.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono font-semibold">{aiResult.confidence}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                    <p className="text-[11px] text-slate-400">Applicable Legal Sections</p>
                    <p className="font-semibold text-amber-300 mt-0.5">{aiResult.ipcSection}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-mono">{aiResult.bnsSection}</p>
                  </div>
                </div>

                {/* DUPLICATE DETECTION ALERT BANNER */}
                {duplicateResult.isDuplicate && duplicateResult.matchedFir ? (
                  <div className="bg-rose-950/60 border border-rose-700/80 rounded-lg p-3 text-xs text-rose-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Potential Duplicate Incident Detected ({duplicateResult.similarityScore}% match):</span>
                      <p className="mt-0.5 text-rose-200 leading-relaxed">
                        A highly similar incident was previously registered under <strong>{duplicateResult.matchedFir.firNumber}</strong> at {duplicateResult.matchedFir.incidentLocation}.
                        Please verify if this is an addendum or a separate independent event.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>No duplicate complaints detected in current police station database.</span>
                  </div>
                )}

                {/* Statutory AI Disclaimer */}
                <p className="text-[10px] text-slate-400 italic">
                  * Statutory Notice: AI category suggestions and section citations are advisory. The Investigating Officer (IO) conducts statutory evaluation under CrPC Section 154 / BNSS Section 173.
                </p>
              </div>

              {/* Crime Category Override Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selected Crime Head / Category {hasUserOverriddenAi && <span className="text-amber-600 font-normal">(Manually Selected)</span>}
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={e => handleManualCategorySelect(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white font-medium"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ipcSection})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: ACCUSED & EVIDENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Step 3: Suspect Information & Evidence Vault</h4>
                <p className="text-xs text-slate-500">Provide any suspect details and upload supporting documents.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accused Identity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Unknown', 'Known', 'Suspected'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccusedType(type)}
                      className={`py-2 text-xs font-medium rounded-lg border transition ${
                        accusedType === type
                          ? 'bg-[#0B132B] text-white border-[#0B132B]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accused / Suspect Details (Name, Phone, Description, Vehicle, Address)
                </label>
                <textarea
                  rows={2}
                  value={accusedDetails}
                  onChange={e => setAccusedDetails(e.target.value)}
                  placeholder="If known or suspected, enter names, physical appearance, clothing, phone numbers, UPI VPAs..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Particulars of Stolen Property / Defrauded Amount
                </label>
                <input
                  type="text"
                  value={stolenPropertyDetails}
                  onChange={e => setStolenPropertyDetails(e.target.value)}
                  placeholder="e.g. Apple MacBook Air M2, INR 1,45,000 cash, Gold Jewelry 40g, Vehicle Reg No"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Digital Evidence Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supporting Evidence (Photographs, Invoices, Bank Statements, CCTV Stills)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700">Attach supporting files for forensic logging</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, PDF, MP4 up to 16MB</p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddSampleEvidence}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition"
                    >
                      + Add Sample Attachment
                    </button>
                  </div>
                </div>

                {evidenceFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-600">Attached Evidence Items ({evidenceFiles.length}):</p>
                    {evidenceFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-600" />
                          <span className="font-medium text-slate-800">{f.name}</span>
                          <span className="text-[11px] text-slate-400">({(f.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEvidenceFiles(evidenceFiles.filter((_, idx) => idx !== i))}
                          className="text-rose-500 hover:text-rose-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & DECLARATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Step 4: Formal Verification & Legal Declaration</h4>
                <p className="text-xs text-slate-500">Please review all submitted details before digital submission.</p>
              </div>

              {/* Review Summary Docket Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-500">Complainant:</span>
                    <p className="font-bold text-slate-900">{complainantName}</p>
                    <p className="text-[11px] text-slate-600">{complainantPhone} · {complainantEmail}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Police Station:</span>
                    <p className="font-bold text-slate-900">{policeStation}</p>
                    <p className="text-[11px] text-slate-600">Code: {stationCode}</p>
                  </div>
                </div>

                <div className="border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Crime Head & Offense Sections:</span>
                  <p className="font-bold text-slate-900">
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </p>
                  <p className="text-[11px] text-amber-700 font-mono">
                    {categories.find(c => c.id === selectedCategoryId)?.ipcSection} | {categories.find(c => c.id === selectedCategoryId)?.bnsSection}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">Narrative Preview:</span>
                  <p className="text-slate-700 italic bg-white p-2.5 rounded border border-slate-200 mt-1 line-clamp-3">
                    "{incidentDescription}"
                  </p>
                </div>
              </div>

              {/* Legal Declaration Checkbox */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 text-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digitalDeclaration}
                    onChange={e => setDigitalDeclaration(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-slate-800 space-y-1">
                    <p className="font-bold">Digital Statutory Declaration (under BNSS 2023 / CrPC 154)</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      I solemnly affirm that the information submitted above is true, complete, and correct to the best of my knowledge. I understand that submitting false or fabricated information to the police is a punishable offense under Section 217 of Bharatiya Nyaya Sanhita (BNS) / Section 182 Indian Penal Code.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && incidentDescription.length < 20) {
                  alert('Please enter at least 20 characters for the incident description.');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2 bg-[#0B132B] hover:bg-[#1C2541] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!digitalDeclaration}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs shadow transition flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-slate-950" />
              <span>Submit & Generate Official FIR Receipt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
