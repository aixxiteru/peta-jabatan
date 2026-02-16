
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, BookOpen, UserCheck, RefreshCw, Calendar, X, Filter, Landmark } from 'lucide-react';
import { StatCardProps, JobPosition } from '../types';
import { jobPositions as mockPositions } from '../mockData';
import { ShortageDetailModal } from './ShortageDetailModal';
import StatusCard from './StatusCard';
import './StatusCard.css';

const StatCard: React.FC<StatCardProps & { ketersediaan?: number; kekurangan?: number; onKekuranganClick?: () => void }> = ({ title, count, color, ketersediaan, kekurangan, icon: Icon, onKekuranganClick }) => {
  const colorClasses = {
    blue: 'bg-sky-500 border-sky-500',
    green: 'bg-blue-600 border-blue-600',
    gray: 'bg-slate-500 border-slate-500',
    orange: 'bg-amber-500 border-amber-500',
  };

  return (
    <div className={`bg-white rounded shadow-sm overflow-hidden border-t-4 ${colorClasses[color]}`}>
      <div className="p-4 flex items-start justify-between">
        <div>
           <div className={`p-3 rounded-md text-white inline-block mb-3 shadow-md ${colorClasses[color]} bg-opacity-90`}>
              <Icon size={24} />
           </div>
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
           <p className="text-2xl font-black text-gray-800">{count.toLocaleString('id-ID')}</p>
        </div>
      </div>
      {(ketersediaan !== undefined || kekurangan !== undefined) && (
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between text-[10px] font-bold">
            {ketersediaan !== undefined && (
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 uppercase">Ketersediaan</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{ketersediaan.toLocaleString('id-ID')}</span>
                </div>
            )}
            {kekurangan !== undefined && (
                 <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 uppercase">Kekurangan</span>
                    <button 
                        onClick={onKekuranganClick}
                        disabled={kekurangan <= 0}
                        className={`${
                            kekurangan > 0 
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer' 
                            : 'bg-emerald-100 text-emerald-700 cursor-default'
                        } px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 group`}
                        title={kekurangan > 0 ? "Klik untuk lihat detail kekurangan" : ""}
                    >
                        {kekurangan.toLocaleString('id-ID')}
                        {kekurangan > 0 && <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">KLIK</span>}
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export const DashboardHome: React.FC = () => {
  const [allPositions, setAllPositions] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [viewingShortageFor, setViewingShortageFor] = useState<string | null>(null);
  
  // Chart Specific States
  const [activeChartCategory, setActiveChartCategory] = useState<string>('SEMUA');
  const [selectedChartUnit, setSelectedChartUnit] = useState<string>('SEMUA UNIT');
  
  const [stats, setStats] = useState({
    totalPNS: 0,
    struktural: { ketersediaan: 0, kebutuhan: 0, kekurangan: 0 },
    fungsional: { ketersediaan: 0, kebutuhan: 0, kekurangan: 0 },
    pelaksana: { ketersediaan: 0, kebutuhan: 0, kekurangan: 0 },
    lastSync: ''
  });

  const safeParseInt = (val: string): number => {
    if (!val || val === '-' || val === '') return 0;
    const cleanVal = val.toString().replace(/\./g, '').replace(/[^-0-9]/g, '');
    const parsed = parseInt(cleanVal);
    return isNaN(parsed) ? 0 : parsed;
  };

  const updatePeriods = useMemo(() => {
    const periodsSet = new Set<string>(allPositions.map(p => p.periodeUpdate || '-'));
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
  }, [allPositions]);

  const allUnits = useMemo(() => {
    const unitsSet = new Set<string>(allPositions.map(p => p.unitKerja).filter(u => u && u !== ''));
    return ['SEMUA UNIT', ...Array.from(unitsSet).sort()];
  }, [allPositions]);

  useEffect(() => {
    if (updatePeriods.length > 0) {
      if (!selectedPeriod || !updatePeriods.includes(selectedPeriod)) {
        setSelectedPeriod(updatePeriods[0]);
      }
    }
  }, [updatePeriods, selectedPeriod]);

  const calculateFromPositions = useCallback((positions: any[], period: string) => {
    let sB = 0, sK = 0;
    let fB = 0, fK = 0;
    let pB = 0, pK = 0;
    let totalAllB = 0;

    const filtered = positions.filter(pos => pos.periodeUpdate === period);

    filtered.forEach(pos => {
      const b = pos.ketersediaan || 0;
      const k = pos.kebutuhan || 0;
      const jenis = (pos.jenisJabatan || '').toUpperCase();

      totalAllB += b;

      if (jenis.includes('PRATAMA') || jenis.includes('ADMIN') || jenis.includes('PENGAWAS') || jenis.includes('STRUK')) {
        sB += b; sK += k;
      } else if (jenis.includes('FUNG')) {
        fB += b; fK += k;
      } else {
        pB += b; pK += k;
      }
    });

    setStats(prev => ({
      ...prev,
      totalPNS: totalAllB,
      struktural: { ketersediaan: sB, kebutuhan: sK, kekurangan: sK - sB },
      fungsional: { ketersediaan: fB, kebutuhan: fK, kekurangan: fK - fB },
      pelaksana: { ketersediaan: pB, kebutuhan: pK, kekurangan: pK - pB },
    }));
  }, []);

  useEffect(() => {
    if (allPositions.length > 0 && selectedPeriod) {
        calculateFromPositions(allPositions, selectedPeriod);
    }
  }, [allPositions, selectedPeriod, calculateFromPositions]);

  const loadData = useCallback(() => {
    const syncedData = localStorage.getItem('synced_job_data');
    const lastSync = localStorage.getItem('last_sync_time') || '';
    
    if (syncedData) {
      try {
        const lines = syncedData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length > 1) {
          const headerLine = lines[0].toLowerCase();
          const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
          
          const idxJenis = headers.findIndex(h => h === 'jenis' || h === 'jenis jabatan' || h === 'kategori');
          const idxJabatan = headers.findIndex(h => h === 'jabatan' || h === 'nama jabatan' || h === 'nama');
          const idxUnit = headers.findIndex(h => h === 'unit kerja' || h === 'unit' || h === 'satker');
          let idxB = headers.findIndex(h => h === 'real time' || h === 'realtime');
          if (idxB === -1) idxB = headers.findIndex(h => h === 'bezzeting (b)' || h === 'bezetting (b)' || h === 'b');
          let idxK = headers.findIndex(h => h === 'kebutuhan (k)' || h === 'k');
          let idxPeriode = headers.findIndex(h => h === 'periode update' || h === 'periode' || h === 'update');

          const map = {
            jenis: idxJenis !== -1 ? idxJenis : 0,
            jabatan: idxJabatan !== -1 ? idxJabatan : 1,
            unit: idxUnit,
            b: idxB !== -1 ? idxB : 4,
            k: idxK !== -1 ? idxK : 5,
            periode: idxPeriode
          };

          const parsedPositions = lines.slice(1).map((line, index) => {
            const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
            return {
              id: index,
              jabatan: cols[map.jabatan] || '',
              unitKerja: (map.unit !== -1 && cols[map.unit]) ? cols[map.unit] : '',
              jenisJabatan: cols[map.jenis] || 'PELAKSANA',
              ketersediaan: safeParseInt(cols[map.b]),
              kebutuhan: safeParseInt(cols[map.k]),
              periodeUpdate: (map.periode !== -1 && cols[map.periode]) ? cols[map.periode] : '-'
            };
          });

          setAllPositions(parsedPositions);
          setStats(prev => ({ ...prev, lastSync }));
        } else {
          setAllPositions(mockPositions);
          setStats(prev => ({ ...prev, lastSync }));
        }
      } catch (e) {
        console.error("Dashboard calculation error:", e);
        setAllPositions(mockPositions);
        setStats(prev => ({ ...prev, lastSync }));
      }
    } else {
      setAllPositions(mockPositions);
      setStats(prev => ({ ...prev, lastSync }));
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('storage_sync_complete', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage_sync_complete', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const chartDataToDisplay = useMemo(() => {
    const filteredByUnitAndPeriod = allPositions.filter(pos => {
        if (pos.periodeUpdate !== selectedPeriod) return false;
        if (selectedChartUnit !== 'SEMUA UNIT' && pos.unitKerja !== selectedChartUnit) return false;
        return true;
    });

    const getAggregates = (positions: any[]) => {
        let sB = 0, sK = 0;
        let fB = 0, fK = 0;
        let pB = 0, pK = 0;
        let tB = 0, tK = 0;

        positions.forEach(pos => {
            const b = pos.ketersediaan || 0;
            const k = pos.kebutuhan || 0;
            const jenis = (pos.jenisJabatan || '').toUpperCase();
            
            tB += b;
            tK += k;

            if (jenis.includes('PRATAMA') || jenis.includes('ADMIN') || jenis.includes('PENGAWAS') || jenis.includes('STRUK')) {
                sB += b; sK += k;
            } else if (jenis.includes('FUNG')) {
                fB += b; fK += k;
            } else {
                pB += b; pK += k;
            }
        });

        return {
            semua: { Ketersediaan: tB, Kebutuhan: tK, Kekurangan: Math.max(0, tK - tB) },
            struktural: { Ketersediaan: sB, Kebutuhan: sK, Kekurangan: Math.max(0, sK - sB) },
            fungsional: { Ketersediaan: fB, Kebutuhan: fK, Kekurangan: Math.max(0, fK - fB) },
            pelaksana: { Ketersediaan: pB, Kebutuhan: pK, Kekurangan: Math.max(0, pK - pB) }
        };
    };

    const aggregates = getAggregates(filteredByUnitAndPeriod);

    // Filter by active category
    if (activeChartCategory === 'SEMUA') {
        return [
            { name: 'SEMUA KATEGORI', ...aggregates.semua }
        ];
    } else {
        const key = activeChartCategory.toLowerCase() as keyof typeof aggregates;
        return [
            { name: activeChartCategory, ...aggregates[key] }
        ];
    }
  }, [activeChartCategory, selectedChartUnit, allPositions, selectedPeriod]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 border-l-4 border-blue-600 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <h2 className="font-bold text-gray-800 tracking-tight uppercase text-sm">RINGKASAN EKSEKUTIF E-PETA JABATAN</h2>
          <div className="font-semibold text-gray-500 uppercase text-xs leading-tight mb-1">BADAN STANDARDISASI DAN KEBIJAKAN INDUSTRI PUSAT</div>
          {stats.lastSync && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 mt-1">
              <RefreshCw size={12} className="animate-pulse" />
              SINKRONISASI TERAKHIR: {stats.lastSync}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
               <select
                   value={selectedPeriod}
                   onChange={(e) => setSelectedPeriod(e.target.value)}
                   className="block w-full px-10 py-2 border border-emerald-300 bg-emerald-50/30 font-bold rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none text-emerald-900 appearance-none shadow-sm"
               >
                   {updatePeriods.map((period, idx) => (
                       <option key={period} value={period}>
                           PERIODE: {period} {idx === 0 ? '(TERBARU)' : ''}
                       </option>
                   ))}
                   {updatePeriods.length === 0 && <option value="">Tidak ada periode</option>}
               </select>
               <Calendar size={14} className="absolute left-3 top-2.5 text-emerald-500 pointer-events-none" />
               <div className="absolute right-3 top-2.5 pointer-events-none border-l pl-2 border-emerald-200">
                    <FilterIcon size={12} className="text-emerald-500" />
               </div>
            </div>
            
            {updatePeriods.length > 0 && selectedPeriod !== updatePeriods[0] && (
                <button 
                    onClick={() => setSelectedPeriod(updatePeriods[0])}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors border border-rose-100 shadow-sm"
                    title="Reset ke Periode Terbaru"
                >
                    <X size={16} />
                </button>
            )}
        </div>
      </div>

      <div className="dashboard-summary-grid">
        <StatusCard
          icon={<UserCheck size={28} color="#2563eb" />}
          title="TOTAL PNS AKTIF"
          mainValue={stats.totalPNS}
          kebutuhan={
            stats.struktural.kebutuhan +
            stats.fungsional.kebutuhan +
            stats.pelaksana.kebutuhan
          }
          shortage={
            stats.struktural.kekurangan +
            stats.fungsional.kekurangan +
            stats.pelaksana.kekurangan
          }
          barColor="#2563eb"
        />
        <StatusCard
          icon={<Briefcase size={28} color="#2563eb" />}
          title="STRUKTURAL"
          mainValue={stats.struktural.ketersediaan}
          kebutuhan={stats.struktural.kebutuhan}
          shortage={stats.struktural.kekurangan}
          barColor="#2563eb"
          onShortageClick={() => setViewingShortageFor('STRUKTURAL')}
        />
        <StatusCard
          icon={<BookOpen size={28} color="#22c55e" />}
          title="FUNGSIONAL"
          mainValue={stats.fungsional.ketersediaan}
          kebutuhan={stats.fungsional.kebutuhan}
          shortage={stats.fungsional.kekurangan}
          barColor="#22c55e"
          onShortageClick={() => setViewingShortageFor('FUNGSIONAL')}
        />
        <StatusCard
          icon={<Users size={28} color="#fbbf24" />}
          title="PELAKSANA"
          mainValue={stats.pelaksana.ketersediaan}
          kebutuhan={stats.pelaksana.kebutuhan}
          shortage={stats.pelaksana.kekurangan}
          barColor="#fbbf24"
          onShortageClick={() => setViewingShortageFor('PELAKSANA')}
        />
      </div>

      <div className="dashboard-chart-container">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
                <div>
                    <h3 className="dashboard-chart-title">GRAFIK ANALISIS KEBUTUHAN VS KETERSEDIAAN</h3>
                    <p className="dashboard-chart-subtitle">VISUALISASI PERIODE: <span className="dashboard-chart-period">{selectedPeriod}</span></p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedChartUnit}
                        onChange={(e) => setSelectedChartUnit(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded text-[10px] font-bold focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 text-gray-700 appearance-none shadow-sm"
                    >
                        {allUnits.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                    <Landmark size={14} className="absolute left-3 top-2 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-lg gap-1 shadow-inner">
                    {['SEMUA', 'STRUKTURAL', 'FUNGSIONAL', 'PELAKSANA'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveChartCategory(cat)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                activeChartCategory === cat 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartDataToDisplay}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', fontSize: '11px' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }}/>
              
              {/* URUTAN BARIS INI MENENTUKAN URUTAN DI GRAFIK & LEGENDA (KIRI KE KANAN) */}
              <Bar name="Kebutuhan (K)" dataKey="Kebutuhan" fill="#334155" radius={[6, 6, 0, 0]} barSize={45} />
              <Bar name="Ketersediaan (B)" dataKey="Ketersediaan" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={45} />
              <Bar name="Kekurangan" dataKey="Kekurangan" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shortage Detail Modal */}
      <ShortageDetailModal 
        category={viewingShortageFor} 
        period={selectedPeriod} 
        positions={allPositions} 
        onClose={() => setViewingShortageFor(null)} 
      />
    </div>
  );
};

const FilterIcon = ({ size, className }: { size: number; className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);
