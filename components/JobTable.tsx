
import React, { useState, useEffect, useMemo } from 'react';
import { Info, List, Printer, Search, Database, RefreshCw, AlertCircle, CheckCircle2, Filter, X, Calendar, Landmark, Activity } from 'lucide-react';
import { jobPositions as initialJobPositions } from '../mockData';
import { EmployeeListModal } from './EmployeeListModal';
import { JobPosition } from '../types';

interface JobTableProps {
    mode: 'peta';
}

export const JobTable: React.FC<JobTableProps> = () => {
  const [viewingEmployeesFor, setViewingEmployeesFor] = useState<string | null>(null);
  const [displayPositions, setDisplayPositions] = useState<JobPosition[]>(initialJobPositions);
  const [dataSource, setDataSource] = useState<'local' | 'synced'>('local');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{type: 'success' | 'error' | 'none', msg: string}>({type: 'none', msg: ''});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('Semua Unit Kerja');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Semua Status');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState('');

  const formatUnitKerja = (name: string): string => {
    if (!name) return '-';
    return name.replace(/\bSEKRETARIAT\b/g, 'Sekretariat');
  };

  const safeParseInt = (val: string): number => {
    if (!val || val === '-' || val === '') return 0;
    const cleanVal = val.toString().replace(/\./g, '').replace(/[^-0-9]/g, '');
    const parsed = parseInt(cleanVal);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    // Hanya load data sinkronisasi, tidak update last_sync_time
    loadSyncedData();
    const handleSyncComplete = () => loadSyncedData();
    window.addEventListener('storage_sync_complete', handleSyncComplete);
    return () => window.removeEventListener('storage_sync_complete', handleSyncComplete);
  }, []);

  const loadSyncedData = () => {
    const syncedData = localStorage.getItem('synced_job_data');
    if (syncedData) {
      try {
        const lines = syncedData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length > 1) {
          const headerLine = lines[0].toLowerCase();
          const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
          
          const idxJenis = headers.findIndex(h => h === 'jenis' || h === 'jenis jabatan' || h === 'kategori');
          const idxJabatan = headers.findIndex(h => h === 'jabatan' || h === 'nama jabatan' || h === 'nama');
          const idxGrade = headers.findIndex(h => h === 'grade' || h === 'kelas' || h === 'kelas jabatan');
          let idxB = headers.findIndex(h => h === 'real time' || h === 'realtime');
          if (idxB === -1) idxB = headers.findIndex(h => h === 'bezzeting (b)' || h === 'bezetting (b)' || h === 'b');
          let idxK = headers.findIndex(h => h === 'kebutuhan (k)' || h === 'k');
          let idxDiff = headers.findIndex(h => h === 'selisih' || h === '+/-');
          let idxUnit = headers.findIndex(h => h === 'unit kerja' || h === 'unit' || h === 'satker');
          let idxPeriode = headers.findIndex(h => h === 'periode update' || h === 'periode' || h === 'update');

          const map = {
            jenis: idxJenis !== -1 ? idxJenis : 0,
            jabatan: idxJabatan !== -1 ? idxJabatan : 1,
            grade: idxGrade !== -1 ? idxGrade : 2,
            b: idxB !== -1 ? idxB : 4,
            k: idxK !== -1 ? idxK : 5,
            diff: idxDiff,
            unit: idxUnit,
            periode: idxPeriode
          };

          const mappedData: JobPosition[] = lines.slice(1).map((line, index) => {
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
            const bezetting = safeParseInt(cols[map.b]);
            const kebutuhan = safeParseInt(cols[map.k]);
            const diffValue = map.diff !== -1 ? safeParseInt(cols[map.diff]) : (bezetting - kebutuhan);
            
            return {
              id: index + 1,
              jenisJabatan: cols[map.jenis] || '-',
              jabatan: cols[map.jabatan] || '-',
              kelasJabatan: safeParseInt(cols[map.grade]),
              pendidikan: 'Sesuai Standar',
              jurusan: 'Semua Jurusan',
              jumlahABK: kebutuhan,
              ketersediaan: bezetting,
              kebutuhan: kebutuhan,
              unitKerja: (map.unit !== -1 && cols[map.unit]) ? cols[map.unit] : 'TIDAK TERIDENTIFIKASI',
              periodeUpdate: (map.periode !== -1 && cols[map.periode]) ? cols[map.periode] : '-',
              status: (diffValue === 0 ? 'SESUAI' : diffValue < 0 ? 'KURANG' : 'LEBIH') as 'SESUAI' | 'KURANG' | 'LEBIH'
            };
          }).filter(p => p.jabatan !== '-' && p.jabatan !== '');

          if (mappedData.length > 0) {
            setDisplayPositions(mappedData);
            setDataSource('synced');
          }
        }
      } catch (e) {
        console.error("Gagal parsing data sinkronisasi:", e);
        setDisplayPositions(initialJobPositions);
        setDataSource('local');
      }
    } else {
      setDisplayPositions(initialJobPositions);
      setDataSource('local');
    }
  };

  const handleManualSync = async () => {
    const sheetUrl = localStorage.getItem('google_sheet_url');
    const employeeGid = localStorage.getItem('google_employee_gid') || '0';
    if (!sheetUrl) {
      setSyncStatus({type: 'error', msg: 'URL Google Sheet belum dikonfigurasi di halaman Database.'});
      return;
    }

    setIsSyncing(true);
    setSyncStatus({type: 'none', msg: ''});

    try {
      // 1. Sync Job Data
      let csvJobUrl = sheetUrl;
      if (sheetUrl.includes('/edit')) {
        csvJobUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
        const gidMatch = sheetUrl.match(/gid=(\d+)/);
        if (gidMatch) csvJobUrl += `&gid=${gidMatch[1]}`;
      }
      const jobResponse = await fetch(csvJobUrl);
      if (!jobResponse.ok) throw new Error('Akses ditolak pada Job Data.');
      const csvJobData = await jobResponse.text();
      localStorage.setItem('synced_job_data', csvJobData);

      // 2. Sync Employee Data (Data Pegawai_202602)
      let csvEmpUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv') + `&gid=${employeeGid}`;
      const empResponse = await fetch(csvEmpUrl);
      if (empResponse.ok) {
        const csvEmpData = await empResponse.text();
        localStorage.setItem('synced_employee_data', csvEmpData);
      }

      const now = new Date().toLocaleString('id-ID');
      localStorage.setItem('last_manual_sync_time', now);
      localStorage.setItem('last_sync_time', now); // keep for backward compatibility
      
      window.dispatchEvent(new Event('storage_sync_complete'));
      loadSyncedData();
      setSyncStatus({type: 'success', msg: 'Sinkronisasi Berhasil! Data Jabatan & Pegawai telah diperbarui.'});
      setTimeout(() => setSyncStatus({type: 'none', msg: ''}), 4000);
    } catch (err: any) {
      setSyncStatus({type: 'error', msg: err.message || 'Gagal sinkronisasi.'});
    } finally {
      setIsSyncing(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(displayPositions.map(p => p.jenisJabatan.toUpperCase()));
    return ['Semua Kategori', ...Array.from(cats)].sort();
  }, [displayPositions]);

  const workUnits = useMemo(() => {
    const units = new Set(displayPositions.map(p => p.unitKerja || 'TIDAK TERIDENTIFIKASI'));
    return ['Semua Unit Kerja', ...Array.from(units)].sort();
  }, [displayPositions]);

  const updatePeriods = useMemo(() => {
    const periodsSet = new Set<string>(displayPositions.map(p => p.periodeUpdate || '-'));
    const periods = (Array.from(periodsSet) as string[]).filter(p => p !== '-' && p !== '');
    const parseDateValue = (d: string) => {
        const parts = d.split(/[/-]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`).getTime();
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
        }
        return 0;
    };
    return periods.sort((a, b) => parseDateValue(b) - parseDateValue(a));
  }, [displayPositions]);

  useEffect(() => {
    if (updatePeriods.length > 0) {
        if (!selectedPeriodFilter || !updatePeriods.includes(selectedPeriodFilter) || selectedPeriodFilter === 'Semua Periode') {
            setSelectedPeriodFilter(updatePeriods[0]);
        }
    }
  }, [updatePeriods, selectedPeriodFilter]);

  const filteredPositions = useMemo(() => {
    return displayPositions.filter(pos => {
      const matchesSearch = pos.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua Kategori' || pos.jenisJabatan.toUpperCase() === selectedCategory;
      const matchesUnit = selectedUnitFilter === 'Semua Unit Kerja' || pos.unitKerja === selectedUnitFilter;
      const matchesStatus = selectedStatusFilter === 'Semua Status' || pos.status === selectedStatusFilter;
      const matchesPeriod = pos.periodeUpdate === selectedPeriodFilter;
      return matchesSearch && matchesCategory && matchesUnit && matchesStatus && matchesPeriod;
    });
  }, [displayPositions, searchQuery, selectedCategory, selectedUnitFilter, selectedStatusFilter, selectedPeriodFilter]);

  // Status Indikator Filter
  const isCategoryFiltered = selectedCategory !== 'Semua Kategori';
  const isUnitFiltered = selectedUnitFilter !== 'Semua Unit Kerja';
  const isStatusFiltered = selectedStatusFilter !== 'Semua Status';
  const isSearchFiltered = searchQuery !== '';
  const isPeriodFiltered = updatePeriods.length > 0 && selectedPeriodFilter !== updatePeriods[0];

  return (
    <div className="p-6 space-y-6">

      <div className="bg-blue-600 text-white p-4 rounded shadow-sm">
        <div className="flex items-center gap-2 mb-2 font-bold text-sm">
           <Info size={18} />
           INFORMASI E-PETA JABATAN
        </div>
        <ul className="list-disc list-inside text-xs space-y-1 opacity-90 ml-1">
          <li><b>Nama Pegawai</b>: Klik Nama Jabatan untuk melihat daftar pegawai.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
               <select
                   value={selectedPeriodFilter}
                   onChange={(e) => setSelectedPeriodFilter(e.target.value)}
                   className={`block w-full px-3 py-2 border font-bold rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8 transition-all ${
                       isPeriodFiltered 
                       ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10' 
                       : 'border-emerald-300 bg-emerald-50/30 text-emerald-900'
                   }`}
               >
                   {updatePeriods.map((period, idx) => (
                       <option key={period} value={period}>
                           {period} {idx === 0 ? '(Terbaru)' : ''}
                       </option>
                   ))}
                   {updatePeriods.length === 0 && <option value="">Tidak ada periode</option>}
               </select>
               <Calendar size={14} className={`absolute right-3 top-3 pointer-events-none ${isPeriodFiltered ? 'text-blue-500' : 'text-emerald-500'}`} />
               {isPeriodFiltered && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>}
            </div>

            <div className="relative">
               <select
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className={`block w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8 transition-all ${
                       isCategoryFiltered 
                       ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10 font-medium' 
                       : 'border-gray-300 bg-white text-gray-900'
                   }`}
               >
                   {categories.map(cat => (
                       <option key={cat} value={cat}>{cat}</option>
                   ))}
               </select>
               <Filter size={14} className={`absolute right-3 top-3 pointer-events-none ${isCategoryFiltered ? 'text-blue-500' : 'text-gray-400'}`} />
               {isCategoryFiltered && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>}
            </div>

            <div className="relative">
               <select
                   value={selectedUnitFilter}
                   onChange={(e) => setSelectedUnitFilter(e.target.value)}
                   className={`block w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8 transition-all ${
                       isUnitFiltered 
                       ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10 font-medium' 
                       : 'border-gray-300 bg-white text-gray-900'
                   }`}
               >
                   {workUnits.map(unit => (
                       <option key={unit} value={unit}>{unit === 'Semua Unit Kerja' ? unit : formatUnitKerja(unit)}</option>
                   ))}
               </select>
               <Landmark size={14} className={`absolute right-3 top-3 pointer-events-none ${isUnitFiltered ? 'text-blue-500' : 'text-gray-400'}`} />
               {isUnitFiltered && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>}
            </div>

            <div className="relative">
               <select
                   value={selectedStatusFilter}
                   onChange={(e) => setSelectedStatusFilter(e.target.value)}
                   className={`block w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none pr-8 transition-all ${
                       isStatusFiltered 
                       ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10 font-medium' 
                       : 'border-gray-300 bg-white text-gray-900'
                   }`}
               >
                   <option value="Semua Status">Semua Status</option>
                   <option value="SESUAI">Sesuai (Balance)</option>
                   <option value="KURANG">Kurang (Minus)</option>
                   <option value="LEBIH">Lebih (Surplus)</option>
               </select>
               <Activity size={14} className={`absolute right-3 top-3 pointer-events-none ${isStatusFiltered ? 'text-blue-500' : 'text-gray-400'}`} />
               {isStatusFiltered && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>}
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className={isSearchFiltered ? 'text-blue-500' : 'text-gray-400'} />
                </div>
                <input
                    type="text"
                    placeholder="Cari Nama Jabatan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                        isSearchFiltered 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/10 font-medium' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                />
                {isSearchFiltered && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-rose-500"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
         </div>

         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t mt-4">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span>Hasil: <span className="text-blue-600 font-bold">{filteredPositions.length}</span> dari <span className="font-bold">{displayPositions.length}</span> Jabatan</span>
                {(isCategoryFiltered || isUnitFiltered || isStatusFiltered || isSearchFiltered || isPeriodFiltered) && (
                    <button 
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('Semua Kategori');
                            setSelectedUnitFilter('Semua Unit Kerja');
                            setSelectedStatusFilter('Semua Status');
                            if (updatePeriods.length > 0) setSelectedPeriodFilter(updatePeriods[0]);
                        }}
                        className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold ml-2 underline underline-offset-2 animate-pulse"
                    >
                        <X size={12} /> Reset Filter
                    </button>
                )}
            </div>
            
            <div className="flex flex-col items-start gap-1 w-full sm:w-auto">
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`flex-1 sm:flex-none px-5 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  isSyncing ? 'bg-gray-300 text-gray-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Memproses...' : 'Sinkronkan Sekarang'}
              </button>
              {/* Info SINKRONISASI TERAKHIR: tampilkan di bawah tombol Sinkronkan Sekarang */}
              {(() => {
                const lastSync = localStorage.getItem('last_manual_sync_time');
                if (!lastSync) return null;
                return (
                  <div className="mt-1 text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                    <RefreshCw size={10} className="text-emerald-400" />
                    <span>SINKRONISASI TERAKHIR:</span>
                    <span className="text-emerald-700 font-bold">{lastSync}</span>
                  </div>
                );
              })()}
            </div>
         </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-blue-600 text-white text-[10px] uppercase tracking-wider">
                        <th className="p-4 font-bold border-r border-blue-500 w-10 text-center">No</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-20 min-w-[50px] max-w-[70px]">Unit Kerja</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-32">Kategori</th>
                        <th className="p-4 font-bold border-r border-blue-500 min-w-[250px]">Nama Jabatan</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-16 text-center">Grade</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-12 text-center">B</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-12 text-center">K</th>
                        <th className="p-4 font-bold border-r border-blue-500 w-12 text-center">+/-</th>
                        <th className="p-4 font-bold w-20 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="text-[11px] text-gray-700">
                    {filteredPositions.length > 0 ? filteredPositions.map((row, index) => {
                        const selisih = row.ketersediaan - row.kebutuhan;
                        return (
                          <tr key={row.id} className="even:bg-gray-50/50 hover:bg-sky-50 transition-colors border-b border-gray-100">
                              <td className="p-4 text-center border-r border-gray-200 text-xs text-gray-700 font-medium">{index + 1}</td>
                                <td className="p-4 border-r border-gray-200 text-xs font-semibold text-gray-700 truncate max-w-[100px]" style={{width: 100, minWidth: 50, maxWidth: 1000}}>
                                  <div className="flex items-center gap-1.5">
                                    <Landmark size={12} className="text-gray-400 shrink-0" />
                                    {formatUnitKerja(row.unitKerja || '')}
                                  </div>
                                </td>
                              <td className="p-4 border-r border-gray-200 text-xs text-gray-500 uppercase font-semibold">{row.jenisJabatan}</td>
                              <td className="p-4 border-r border-gray-200 text-xs font-semibold">
                                  <div className="flex items-center justify-between cursor-pointer group" onClick={() => setViewingEmployeesFor(row.jabatan)}>
                                      <span className="group-hover:text-blue-600 uppercase">{row.jabatan}</span>
                                      <Search size={14} className="text-blue-300 opacity-0 group-hover:opacity-100" />
                                  </div>
                              </td>
                              <td className="p-4 text-center border-r border-gray-200 text-xs font-mono text-gray-500">{row.kelasJabatan}</td>
                              <td className="p-4 text-center border-r border-gray-200 text-xs font-bold text-blue-700 bg-blue-50/10">
                                {row.ketersediaan}
                              </td>
                              <td className="p-4 text-center border-r border-gray-200 text-xs font-bold text-amber-700 bg-amber-50/10">
                                {row.kebutuhan}
                              </td>
                              <td className={`p-4 text-center border-r border-gray-200 text-xs font-bold ${
                                selisih < 0 ? 'text-rose-600' : 
                                selisih > 0 ? 'text-sky-600' : 'text-gray-300'
                              }`}>
                                {selisih > 0 ? `+${selisih}` : selisih}
                              </td>
                              <td className="p-4 text-center text-xs">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black shadow-sm ${
                                      row.status === 'SESUAI' ? 'bg-white text-gray-400 border border-gray-200' :
                                      row.status === 'KURANG' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'
                                  }`}>
                                      {row.status}
                                  </span>
                              </td>
                          </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={9} className="p-20 text-center text-gray-400 italic">
                                Tidak ada data yang tersedia untuk filter ini pada periode {selectedPeriodFilter}.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
      <EmployeeListModal 
        jobTitle={viewingEmployeesFor} 
        unitKerjaFilter={selectedUnitFilter !== 'Semua Unit Kerja' ? selectedUnitFilter : undefined}
        onClose={() => setViewingEmployeesFor(null)} 
      />
    </div>
  );
};
