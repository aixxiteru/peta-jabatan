
import React, { useMemo } from 'react';
import { X, AlertTriangle, Landmark, Briefcase, BookOpen, Users } from 'lucide-react';

interface ShortageDetailModalProps {
  category: string | null;
  period: string;
  positions: any[];
  onClose: () => void;
}

export const ShortageDetailModal: React.FC<ShortageDetailModalProps> = ({ category, period, positions, onClose }) => {
  const filteredShortages = useMemo(() => {
    if (!category) return [];
    
    const catUpper = category.toUpperCase();
    return positions.filter(pos => {
      if (pos.periodeUpdate !== period) return false;
      
      const b = pos.ketersediaan || 0;
      const k = pos.kebutuhan || 0;
      if (b >= k) return false;

      const jenis = (pos.jenisJabatan || '').toUpperCase();
      if (catUpper === 'STRUKTURAL') {
        return jenis.includes('PRATAMA') || jenis.includes('ADMIN') || jenis.includes('PENGAWAS') || jenis.includes('STRUK');
      } else if (catUpper === 'FUNGSIONAL') {
        return jenis.includes('FUNG');
      } else if (catUpper === 'PELAKSANA') {
        return !jenis.includes('PRATAMA') && !jenis.includes('ADMIN') && !jenis.includes('PENGAWAS') && !jenis.includes('STRUK') && !jenis.includes('FUNG');
      }
      return false;
    });
  }, [category, period, positions]);

  if (!category) return null;

  const getIcon = () => {
    switch(category.toUpperCase()) {
      case 'STRUKTURAL': return <Briefcase size={20} />;
      case 'FUNGSIONAL': return <BookOpen size={20} />;
      default: return <Users size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-gray-300">
        {/* Header */}
        <div className="bg-rose-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
                {getIcon()}
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-white">Detail Kekurangan Jabatan {category}</h3>
              <p className="text-[10px] text-rose-100 mt-0.5 font-bold uppercase tracking-tight">Periode: {period}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
          {filteredShortages.length > 0 ? (
            <div className="p-4 sm:p-6">
              <div className="border border-gray-200 rounded shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                      <tr className="text-[10px] uppercase font-bold text-gray-500 border-b tracking-wider">
                        <th className="p-4 w-12 text-center">No</th>
                        <th className="p-4 min-w-[300px]">Nama Jabatan</th>
                        <th className="p-4 min-w-[100px] text-center">B</th>
                        <th className="p-4 min-w-[100px] text-center">K</th>
                        <th className="p-4 min-w-[100px] text-center text-rose-600">Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] text-gray-700">
                      {filteredShortages.map((pos, index) => {
                        const selisih = (pos.ketersediaan || 0) - (pos.kebutuhan || 0);
                        return (
                          <tr key={index} className="border-b hover:bg-rose-50/30 transition-colors">
                            <td className="p-4 text-center text-gray-400 font-mono">{index + 1}</td>
                            <td className="p-4">
                                <div className="font-bold text-gray-800 uppercase leading-tight mb-1">{pos.jabatan || 'NAMA JABATAN TIDAK DITEMUKAN'}</div>
                                {pos.unitKerja && (
                                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                                        <Landmark size={10} />
                                        {pos.unitKerja}
                                    </div>
                                )}
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-gray-600">{(pos.ketersediaan || 0)}</td>
                            <td className="p-4 text-center font-mono font-bold text-gray-600">{(pos.kebutuhan || 0)}</td>
                            <td className="p-4 text-center font-mono font-black text-rose-600 bg-rose-50/30">{selisih}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                <AlertTriangle size={32} className="rotate-180" />
              </div>
              <p className="text-gray-400 text-sm italic font-medium">Tidak ada kekurangan data ditemukan untuk kategori ini.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs uppercase shadow-md active:scale-95 transition-all">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
