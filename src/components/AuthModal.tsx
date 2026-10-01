import React, { useState } from 'react';
import { X, Shield, User, Lock, Phone, Mail, MapPin } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, name: string, rankOrBadge?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'CITIZEN' | 'POLICE'>('CITIZEN');

  // Form states
  const [identifier, setIdentifier] = useState('rajesh.kumar@example.com');
  const [password, setPassword] = useState('User@123');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const handleRoleChange = (newRole: 'CITIZEN' | 'POLICE') => {
    setRole(newRole);
    if (newRole === 'POLICE') {
      setIdentifier('POL-DL-8842');
      setPassword('Officer@123');
    } else {
      setIdentifier('rajesh.kumar@example.com');
      setPassword('User@123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      if (role === 'CITIZEN') {
        onLoginSuccess('CITIZEN', 'Rajesh Kumar Verma', 'Verified Citizen');
      } else {
        if (identifier.includes('4109') || identifier.toLowerCase().includes('sho') || identifier.toLowerCase().includes('admin')) {
          onLoginSuccess('ADMIN', 'Inspector Ananya Sharma', 'Inspector & Cyber Admin (POL-DL-4109)');
        } else {
          onLoginSuccess('POLICE_OFFICER', 'SI Vikram Singh Rathore', 'Sub-Inspector (POL-DL-8842)');
        }
      }
    } else {
      onLoginSuccess('CITIZEN', fullName || 'Citizen User', 'Verified Citizen');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B132B] text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white">E-Rakshak Authentication</h3>
              <p className="text-[11px] text-slate-400">National Police CCTNS Access Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleChange('CITIZEN')}
              className={`py-1.5 rounded-lg transition ${
                role === 'CITIZEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Citizen Login
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('POLICE')}
              className={`py-1.5 rounded-lg transition ${
                role === 'POLICE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Police Official / Admin
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {authMode === 'register' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / District *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </>
          ) : null}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'CITIZEN' ? 'Email or Mobile Number *' : 'Officer Badge Number or Gov Email *'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Secure Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow transition mt-2"
          >
            {authMode === 'login' ? `Login as ${role === 'CITIZEN' ? 'Citizen' : 'Police Officer'}` : 'Complete Registration'}
          </button>

          {role === 'CITIZEN' && (
            <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              {authMode === 'login' ? (
                <span>
                  Don't have a citizen account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
