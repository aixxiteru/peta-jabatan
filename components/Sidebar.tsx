
import React from 'react';

import { LayoutDashboard, Map, History, ChevronLeft, Database } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'peta', label: 'Peta Jabatan', icon: Map },
    { id: 'histori', label: 'Log Status Pegawai', icon: History },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
      <div className="flex items-center justify-between h-14 bg-blue-700 px-4 font-bold text-lg tracking-wider">
        <span>E-PETA JABATAN</span>
        <button onClick={toggleSidebar} className="lg:hidden">
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="flex flex-col justify-start py-1 bg-slate-900 px-4">
        <img
          src="/logo-bskji-small2.png"
          alt="Logo BSKJI"
          className="h-12 mt-2 mb-1 self-start"
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
      </div>
      
      <div className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Main Navigation
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewState)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
              currentView === item.id
                ? 'bg-black/20 border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} className="mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
