import React from 'react';
import { Shield, PhoneCall, UserCheck, Code2, Home, Landmark, ShieldAlert, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: 'citizen' | 'police' | 'code' | 'track';
  setCurrentTab: (tab: 'citizen' | 'police' | 'code' | 'track') => void;
  activeRole: UserRole;
  userName: string;
  userRankOrBadge?: string;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSubmitFir: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  userName,
  userRankOrBadge,
  onOpenAuth,
  onLogout,
  onOpenSubmitFir
}) => {
  return (
    <header className="bg-[#0B132B] text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      {/* Top Police Department Strip */}
      <div className="bg-[#070D1E] border-b border-slate-800/80 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>National Crime and Criminal Tracking Network & Systems (CCTNS)</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">Ministry of Home Affairs & Law Enforcement</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-rose-400 font-medium">
              <PhoneCall className="w-3 h-3 animate-pulse" />
              <span>Police Emergency: <strong>112</strong></span>
            </div>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:inline text-amber-300/80">Cyber Crime Helpline: 1930</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('citizen')}>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">E-RAKSHAK</span>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Online FIR Lodging, Investigation Docket & AI Crime Intelligence
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <nav className="flex items-center gap-1 bg-[#1C2541]/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setCurrentTab('citizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg transition-colors ${
                currentTab === 'citizen'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => setCurrentTab('track')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg transition-colors ${
                currentTab === 'track'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Track FIR</span>
            </button>

            <button
              onClick={() => setCurrentTab('police')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg transition-colors ${
                currentTab === 'police'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Police HQ</span>
            </button>

            <button
              onClick={() => setCurrentTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg transition-colors ${
                currentTab === 'code'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Project Source & Viva</span>
              <span className="md:hidden">Source</span>
            </button>
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSubmitFir}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition"
            >
              <span>+ Lodge FIR</span>
            </button>

            {userName ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{userName}</p>
                  <p className="text-[10px] text-slate-400">
                    {userRankOrBadge || (activeRole === 'CITIZEN' ? 'Registered Citizen' : 'Police Official')}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {userName.charAt(0)}
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
