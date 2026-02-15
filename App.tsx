
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardHome } from './components/DashboardHome';
import { JobTable } from './components/JobTable';
import { EmployeeStatusHistory } from './components/EmployeeStatusHistory';
import { DatabaseSettings } from './components/DatabaseSettings';
import { ViewState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1GfE_sn4ATSf0r0t6dn1WymuScWF-HzIxLYdmnGJx8FA/edit?gid=1142006045#gid=1142006045';
  const DEFAULT_GID_PEGAWAI = '208853000';

  useEffect(() => {
    let savedUrl = localStorage.getItem('google_sheet_url');
    let savedGid = localStorage.getItem('google_employee_gid');
    
    // Set default jika belum ada di localStorage
    if (!savedUrl) {
      localStorage.setItem('google_sheet_url', DEFAULT_SHEET_URL);
      savedUrl = DEFAULT_SHEET_URL;
    }
    
    if (!savedGid) {
      localStorage.setItem('google_employee_gid', DEFAULT_GID_PEGAWAI);
      savedGid = DEFAULT_GID_PEGAWAI;
    }

    const autoSync = async (url: string, empGid: string) => {
      try {
        // 1. Sinkron Data Peta Jabatan
        let csvJobUrl = url;
        if (url.includes('/edit')) {
          csvJobUrl = url.replace(/\/edit.*$/, '/export?format=csv');
          const gidMatch = url.match(/gid=(\d+)/);
          if (gidMatch) csvJobUrl += `&gid=${gidMatch[1]}`;
        }

        const jobResponse = await fetch(csvJobUrl);
        if (jobResponse.ok) {
          const csvJobData = await jobResponse.text();
          localStorage.setItem('synced_job_data', csvJobData);
        }

        // 2. Sinkron Data Pegawai
        let csvEmpUrl = url.replace(/\/edit.*$/, '/export?format=csv') + `&gid=${empGid}`;
        const empResponse = await fetch(csvEmpUrl);
        if (empResponse.ok) {
          const csvEmpData = await empResponse.text();
          localStorage.setItem('synced_employee_data', csvEmpData);
        }

        const now = new Date().toLocaleString('id-ID');
        localStorage.setItem('last_sync_time', now);
        
        window.dispatchEvent(new Event('storage_sync_complete'));
        console.log(`Auto-sync berhasil dengan GID: ${empGid}`);
      } catch (err) {
        console.error("Auto-sync gagal:", err);
      }
    };

    // Disabled automatic sync on app load. Synchronization now only happens
    // when the user clicks "Sinkronkan Sekarang" in the Peta Jabatan page.
    // autoSync(savedUrl, savedGid);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard': return ['Home', 'Dashboard'];
      case 'peta': return ['Dashboard', 'Peta Jabatan'];
      case 'histori': return ['Dashboard', 'Histori Status Pegawai'];
      case 'database': return ['Settings', 'Database Sync'];
      default: return ['Dashboard'];
    }
  };

  const getPageTitle = () => {
     switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'peta': return 'Peta Jabatan';
      case 'histori': return 'Histori Status Pegawai';
      case 'database': return 'Konfigurasi Database';
      default: return 'Dashboard';
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardHome />;
      case 'peta': return <JobTable mode="peta" />;
      case 'histori': return <EmployeeStatusHistory />;
      case 'database': return <DatabaseSettings />;
      default: return <div className="p-6">Feature under development</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
         )}
        <Header title={getPageTitle()} breadcrumbs={getBreadcrumbs()} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{renderContent()}</main>
        <footer className="bg-white p-4 border-t text-xs text-gray-500 flex justify-between">
            <span>Copyright © 2026 Alam BSKJI. All rights reserved.</span>
        </footer>
      </div>
      
      {/* Portals rendered at app level - outside of main overflow constraint */}
      <div id="modal-root"></div>
    </div>
  );
}

export default App;
