/**
 * TypeScript Data Models for Online FIR Management System
 * Mirrors the MySQL Relational Schema exactly.
 */

export type UserRole = 'CITIZEN' | 'POLICE_OFFICER' | 'ADMIN';

export type FirStatus = 
  | 'Submitted' 
  | 'Verified' 
  | 'Under Investigation' 
  | 'Charge Sheet Filed' 
  | 'Closed' 
  | 'Rejected';

export type PriorityLevel = 'Normal' | 'Urgent' | 'High Priority';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface PoliceOfficer {
  id: number;
  badgeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  rank: 'Constable' | 'Head Constable' | 'Assistant Sub-Inspector' | 'Sub-Inspector' | 'Inspector' | 'Deputy Superintendent of Police';
  policeStation: string;
  stationCode: string;
  district: string;
  state: string;
  activeCasesCount: number;
}

export interface CrimeCategory {
  id: number;
  name: string;
  ipcSection: string;
  bnsSection: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  keywords: string[];
}

export interface EvidenceItem {
  id: number;
  firId: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSizeBytes: number;
  description: string;
  uploadedByType: 'Citizen' | 'Officer' | 'Forensics';
  uploadedByName: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface FirStatusHistory {
  id: number;
  firId: number;
  previousStatus: string | null;
  newStatus: FirStatus;
  changedByName: string;
  changedByRole: string;
  remarks: string;
  changedAt: string;
}

export interface InvestigationUpdate {
  id: number;
  firId: number;
  officerId: number;
  officerName: string;
  officerRank: string;
  badgeNumber: string;
  diaryEntryNumber: string;
  findings: string;
  nextActionPlan?: string;
  witnessStatements?: string;
  isConfidential: boolean;
  recordedAt: string;
}

export interface FIR {
  id: number;
  firNumber: string;
  userId: number;
  complainantName: string;
  complainantPhone: string;
  complainantEmail: string;
  complainantAddress: string;
  complainantAadhaar?: string;
  categoryId: number;
  categoryName: string;
  ipcSection: string;
  bnsSection: string;
  incidentDate: string;
  incidentLocation: string;
  incidentDistrict: string;
  policeStation: string;
  stationCode: string;
  incidentDescription: string;
  accusedType: 'Known' | 'Unknown' | 'Suspected';
  accusedDetails?: string;
  stolenPropertyDetails?: string;
  priority: PriorityLevel;
  status: FirStatus;
  assignedOfficerId?: number | null;
  assignedOfficerName?: string | null;
  assignedOfficerRank?: string | null;
  assignedOfficerBadge?: string | null;
  assignedOfficerPhone?: string | null;
  aiPredictedCategory?: string;
  aiConfidenceScore?: number;
  aiPotentialDuplicateFirId?: number | null;
  aiDuplicateSimilarityScore?: number;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
}
