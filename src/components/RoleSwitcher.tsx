import React from 'react';
import { User, Shield, Briefcase, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onSelectPersona: (persona: 'citizen' | 'officer' | 'inspector' | 'guest') => void;
  currentUserId: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  onSelectPersona,
  currentUserId,
}) => {
  return (
    <div className="bg-[#1C2541] border-b border-slate-700/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-semibold text-amber-400">Quick Persona Switcher:</span>
          <span className="text-slate-400 hidden sm:inline">(Test all user permissions instantly)</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectPersona('citizen')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
              currentUserId === 1
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Citizen: Rajesh Kumar</span>
          </button>

          <button
            onClick={() => onSelectPersona('officer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
              currentUserId === 101
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>IO: SI Vikram Rathore</span>
          </button>

          <button
            onClick={() => onSelectPersona('inspector')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
              currentUserId === 102
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Admin: Inspector Ananya</span>
          </button>

          <button
            onClick={() => onSelectPersona('guest')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium ${
              currentUserId === 0
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Public / Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
