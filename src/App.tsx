/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  INITIAL_CATEGORIES, INITIAL_OFFICERS, INITIAL_USERS, 
  INITIAL_FIRS, INITIAL_EVIDENCE, INITIAL_STATUS_HISTORY, 
  INITIAL_INVESTIGATION_UPDATES 
} from './data/initialData';
import { 
  FIR, PoliceOfficer, User, CrimeCategory, EvidenceItem, 
  FirStatusHistory, InvestigationUpdate, UserRole, FirStatus 
} from './types';

// Components
import { Header } from './components/Header';
import { RoleSwitcher } from './components/RoleSwitcher';
import { CitizenPortal } from './components/CitizenPortal';
import { PolicePortal } from './components/PolicePortal';
import { TrackFirView } from './components/TrackFirView';
import { ProjectSourceViewer } from './components/ProjectSourceViewer';
import { SubmitFirModal } from './components/SubmitFirModal';
import { FirReceiptModal } from './components/FirReceiptModal';
import { FirDossierModal } from './components/FirDossierModal';
import { AssignOfficerModal } from './components/AssignOfficerModal';
import { AddDiaryEntryModal } from './components/AddDiaryEntryModal';
import { OfficerRosterModal } from './components/OfficerRosterModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Global Data State
  const [firs, setFirs] = useState<FIR[]>(INITIAL_FIRS);
  const [categories] = useState<CrimeCategory[]>(INITIAL_CATEGORIES);
  const [officers, setOfficers] = useState<PoliceOfficer[]>(INITIAL_OFFICERS);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(INITIAL_EVIDENCE);
  const [statusHistories, setStatusHistories] = useState<FirStatusHistory[]>(INITIAL_STATUS_HISTORY);
  const [investigationUpdates, setInvestigationUpdates] = useState<InvestigationUpdate[]>(INITIAL_INVESTIGATION_UPDATES);

  // Active User / Persona State
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [userRole, setUserRole] = useState<UserRole>('CITIZEN');
  const [userName, setUserName] = useState<string>('Rajesh Kumar Verma');
  const [userRankOrBadge, setUserRankOrBadge] = useState<string>('Verified Citizen');
  const [userPhone, setUserPhone] = useState<string>('9876543210');
  const [userEmail, setUserEmail] = useState<string>('rajesh.kumar@example.com');

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'citizen' | 'police' | 'code' | 'track'>('citizen');
  const [trackedFirNumber, setTrackedFirNumber] = useState<string | undefined>(undefined);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [receiptFir, setReceiptFir] = useState<FIR | null>(null);
  const [dossierFir, setDossierFir] = useState<FIR | null>(null);
  const [assigningFir, setAssigningFir] = useState<FIR | null>(null);
  const [diaryFir, setDiaryFir] = useState<FIR | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Quick Persona Switcher Handler
  const handleSelectPersona = (persona: 'citizen' | 'officer' | 'inspector' | 'guest') => {
    if (persona === 'citizen') {
      setCurrentUserId(1);
      setUserRole('CITIZEN');
      setUserName('Rajesh Kumar Verma');
      setUserRankOrBadge('Verified Citizen');
      setUserPhone('9876543210');
      setUserEmail('rajesh.kumar@example.com');
      setCurrentTab('citizen');
    } else if (persona === 'officer') {
      setCurrentUserId(101);
      setUserRole('POLICE_OFFICER');
      setUserName('Vikram Singh Rathore');
      setUserRankOrBadge('Sub-Inspector (POL-DL-8842)');
      setUserPhone('+91-98111-22233');
      setUserEmail('vikram.rathore@police.gov.in');
      setCurrentTab('police');
    } else if (persona === 'inspector') {
      setCurrentUserId(102);
      setUserRole('ADMIN');
      setUserName('Ananya Sharma');
      setUserRankOrBadge('Inspector & Station Admin (POL-DL-4109)');
      setUserPhone('+91-98222-33344');
      setUserEmail('ananya.sharma@police.gov.in');
      setCurrentTab('police');
    } else {
      setCurrentUserId(0);
      setUserRole('CITIZEN');
      setUserName('');
      setUserRankOrBadge('');
      setUserPhone('');
      setUserEmail('');
      setCurrentTab('citizen');
    }
  };

  // Submit FIR Handler
  const handleFirSubmitted = (newFir: FIR, newEvidence: EvidenceItem[]) => {
    setFirs([newFir, ...firs]);
    setEvidenceItems([...newEvidence, ...evidenceItems]);

    // Add initial status history
    const initialHist: FirStatusHistory = {
      id: Date.now(),
      firId: newFir.id,
      previousStatus: null,
      newStatus: 'Submitted',
      changedByName: newFir.complainantName,
      changedByRole: 'Citizen (Digital Declaration)',
      remarks: 'Online e-FIR lodged with digital verification under Section 173 BNSS.',
      changedAt: newFir.createdAt
    };
    setStatusHistories([initialHist, ...statusHistories]);

    // Open Printable Acknowledgement Slip immediately
    setReceiptFir(newFir);
  };

  // Update Status Handler
  const handleUpdateStatus = (firId: number, newStatus: FirStatus, remarks: string) => {
    setFirs(firs.map(f => {
      if (f.id === firId) {
        return {
          ...f,
          status: newStatus,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
      }
      return f;
    }));

    if (dossierFir && dossierFir.id === firId) {
      setDossierFir({ ...dossierFir, status: newStatus });
    }

    const newHistory: FirStatusHistory = {
      id: Date.now(),
      firId,
      previousStatus: firs.find(f => f.id === firId)?.status || null,
      newStatus,
      changedByName: userName || 'Investigating Officer',
      changedByRole: userRankOrBadge || 'Police Official',
      remarks,
      changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setStatusHistories([newHistory, ...statusHistories]);
  };

  // Assign Officer Handler
  const handleAssignOfficer = (firId: number, officer: PoliceOfficer) => {
    setFirs(firs.map(f => {
      if (f.id === firId) {
        return {
          ...f,
          assignedOfficerId: officer.id,
          assignedOfficerName: officer.fullName,
          assignedOfficerRank: officer.rank,
          assignedOfficerBadge: officer.badgeNumber,
          assignedOfficerPhone: officer.phone,
          status: f.status === 'Submitted' ? 'Verified' : f.status,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
      }
      return f;
    }));

    if (dossierFir && dossierFir.id === firId) {
      setDossierFir({
        ...dossierFir,
        assignedOfficerId: officer.id,
        assignedOfficerName: officer.fullName,
        assignedOfficerRank: officer.rank,
        assignedOfficerBadge: officer.badgeNumber,
        assignedOfficerPhone: officer.phone,
        status: dossierFir.status === 'Submitted' ? 'Verified' : dossierFir.status
      });
    }

    // Add status history record
    const hist: FirStatusHistory = {
      id: Date.now(),
      firId,
      previousStatus: 'Submitted',
      newStatus: 'Verified',
      changedByName: userName || 'Station In-Charge',
      changedByRole: 'Police Station Authority',
      remarks: `Assigned Investigating Officer: ${officer.rank} ${officer.fullName} (Badge: ${officer.badgeNumber})`,
      changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setStatusHistories([hist, ...statusHistories]);
    setAssigningFir(null);
  };

  // Add Case Diary Entry Handler
  const handleAddDiaryEntry = (firId: number, update: InvestigationUpdate) => {
    setInvestigationUpdates([update, ...investigationUpdates]);
    setDiaryFir(null);
  };

  // Add Police Officer to Roster
  const handleAddOfficer = (officer: PoliceOfficer) => {
    setOfficers([...officers, officer]);
  };

  // Export Report (CSV / JSON)
  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "FIR Number,Date,Complainant,Phone,Crime Category,IPC Section,Police Station,Status,Assigned Officer\n"
      + firs.map(f => `"${f.firNumber}","${f.incidentDate}","${f.complainantName}","${f.complainantPhone}","${f.categoryName}","${f.ipcSection}","${f.policeStation}","${f.status}","${f.assignedOfficerName || 'Unassigned'}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FIR_Crime_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* 1. Header with CCTNS motif & Emergency hotline */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={userRole}
        userName={userName}
        userRankOrBadge={userRankOrBadge}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => handleSelectPersona('guest')}
        onOpenSubmitFir={() => setIsSubmitModalOpen(true)}
      />

      {/* 2. Interactive Quick Persona Switcher */}
      <RoleSwitcher
        currentRole={userRole}
        onSelectPersona={handleSelectPersona}
        currentUserId={currentUserId}
      />

      {/* 3. Main Views */}
      <main className="flex-grow">
        {currentTab === 'citizen' && (
          <CitizenPortal
            firs={currentUserId === 1 ? firs : firs.filter(f => f.userId === currentUserId || currentUserId === 1)}
            userName={userName}
            onOpenSubmitFir={() => setIsSubmitModalOpen(true)}
            onOpenTrackFir={(firNum) => {
              setTrackedFirNumber(firNum);
              setCurrentTab('track');
            }}
            onViewFirDetails={(fir) => setDossierFir(fir)}
            onPrintAcknowledgement={(fir) => setReceiptFir(fir)}
          />
        )}

        {currentTab === 'police' && (
          <PolicePortal
            firs={firs}
            officers={officers}
            users={INITIAL_USERS}
            categories={categories}
            currentOfficerName={userName || 'SI Vikram Singh Rathore'}
            currentOfficerRank={userRankOrBadge || 'Sub-Inspector'}
            onOpenFirDossier={(fir) => setDossierFir(fir)}
            onOpenAssignModal={(fir) => setAssigningFir(fir)}
            onOpenAddDiaryModal={(fir) => setDiaryFir(fir)}
            onOpenRosterModal={() => setIsRosterModalOpen(true)}
            onExportReport={handleExportReport}
          />
        )}

        {currentTab === 'track' && (
          <TrackFirView
            firs={firs}
            statusHistories={statusHistories}
            investigationUpdates={investigationUpdates}
            initialFirNumber={trackedFirNumber}
            onViewFullDossier={(fir) => setDossierFir(fir)}
            onPrintSlip={(fir) => setReceiptFir(fir)}
          />
        )}

        {currentTab === 'code' && (
          <ProjectSourceViewer />
        )}
      </main>

      {/* 4. Modals */}
      <SubmitFirModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        categories={categories}
        existingFirs={firs}
        currentUserId={currentUserId}
        currentUserName={userName}
        currentUserPhone={userPhone}
        currentUserEmail={userEmail}
        onFirSubmitted={handleFirSubmitted}
      />

      <FirReceiptModal
        fir={receiptFir}
        onClose={() => setReceiptFir(null)}
      />

      <FirDossierModal
        fir={dossierFir}
        statusHistories={statusHistories}
        investigationUpdates={investigationUpdates}
        evidenceItems={evidenceItems}
        onClose={() => setDossierFir(null)}
        onUpdateStatus={handleUpdateStatus}
        onOpenAssignModal={(fir) => setAssigningFir(fir)}
        onOpenAddDiaryModal={(fir) => setDiaryFir(fir)}
        onPrintSlip={(fir) => setReceiptFir(fir)}
      />

      <AssignOfficerModal
        fir={assigningFir}
        officers={officers}
        isOpen={assigningFir !== null}
        onClose={() => setAssigningFir(null)}
        onAssign={handleAssignOfficer}
      />

      <AddDiaryEntryModal
        fir={diaryFir}
        isOpen={diaryFir !== null}
        onClose={() => setDiaryFir(null)}
        onAddUpdate={handleAddDiaryEntry}
        currentOfficerName={userName || 'SI Vikram Singh Rathore'}
        currentOfficerRank={userRankOrBadge || 'Sub-Inspector'}
      />

      <OfficerRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        officers={officers}
        onAddOfficer={handleAddOfficer}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(role, name, rankOrBadge) => {
          setUserRole(role);
          setUserName(name);
          setUserRankOrBadge(rankOrBadge || '');
          if (role === 'CITIZEN') {
            setCurrentUserId(1);
            setCurrentTab('citizen');
          } else {
            setCurrentUserId(101);
            setCurrentTab('police');
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-[#0B132B] text-slate-400 text-xs border-t border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>E-Rakshak Crime and Criminal Tracking Network & Systems (CCTNS)</span>
            <span>·</span>
            <span>CrPC Sec 154 / BNSS Sec 173 Compliant</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('code')}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              College Project Source & Viva Kit
            </button>
            <span>·</span>
            <span>Law Enforcement Decision-Support System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
