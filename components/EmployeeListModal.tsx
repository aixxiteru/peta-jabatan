
import React, { useState, useEffect } from 'react';
import { X, User, Loader2, AlertCircle } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeListModalProps {
  jobTitle: string | null;
  onClose: () => void;
}

export const EmployeeListModal: React.FC<EmployeeListModalProps> = ({ jobTitle, onClose }) => {
  const [syncedEmployees, setSyncedEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobTitle) return;

    const loadData = () => {
      setIsLoading(true);
      setError(null);
      const csvData = localStorage.getItem('synced_employee_data');
      
      if (!csvData) {
        setSyncedEmployees([]);
        setIsLoading(false);
        return;
      }

      try {
        const lines = csvData.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length > 1) {
          const headerLine = lines[0];
          
          const commaCount = (headerLine.match(/,/g) || []).length;
          const semiCount = (headerLine.match(/;/g) || []).length;
          const delimiter = semiCount > commaCount ? ';' : ',';
          
          const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
          
          const idxNama = headers.findIndex(h => h.includes('nama'));
          const idxNip = headers.findIndex(h => h.includes('nip'));
          const idxJabatan = headers.findIndex(h => h.includes('jabatan') || h === 'nama_jabatan' || h === 'posisi');
          const idxUnit = headers.findIndex(h => h.includes('unit') || h.includes('satker') || h.includes('kerja'));
          const idxPangkat = headers.findIndex(h => h.includes('pangkat') || h.includes('gol') || h.includes('ruang'));

          if (idxJabatan === -1) {
            throw new Error("Kolom 'Jabatan' tidak ditemukan.");
          }

          const mapped: Employee[] = lines.slice(1).map((line, idx) => {
            const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
            const cols = line.split(regex).map(c => c.trim().replace(/^"|"$/g, ''));
            
            return {
              id: idx,
              nama: cols[idxNama] || '-',
              nip: cols[idxNip] || '-',
              jabatan: cols[idxJabatan] || '',
              unitKerja: cols[idxUnit] || '-',
              pangkat: cols[idxPangkat] || '-',
              golongan: ''
            };
          });

          const cleanTarget = jobTitle.trim().toLowerCase();
          const filtered = mapped.filter(emp => 
            emp.jabatan.trim().toLowerCase() === cleanTarget
          );
          
          setSyncedEmployees(filtered);
        } else {
          setSyncedEmployees([]);
        }
      } catch (e: any) {
        console.error("Error parsing employee data:", e);
        setError("Gagal memproses data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [jobTitle]);

  if (!jobTitle) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-gray-300">
        {/* Header - Fixed Height */}
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
                <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Daftar Pegawai</h3>
              <p className="text-[11px] text-blue-400 mt-0.5 font-bold uppercase tracking-tight leading-tight">{jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1.5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable Height */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 min-h-0">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 py-20">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-[10px] uppercase font-bold tracking-widest">Memuat Data...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-rose-500 py-20">
                <AlertCircle size={32} />
                <p className="font-bold text-xs uppercase">{error}</p>
            </div>
          ) : syncedEmployees.length > 0 ? (
            <div className="border border-gray-200 rounded shadow-sm bg-white overflow-x-auto scrollbar-hide">
              <table className="min-w-[700px] w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <tr className="text-[10px] uppercase font-bold text-gray-500 border-b tracking-wider">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4 w-64">Nama Pegawai</th>
                    <th className="p-4 w-48">NIP</th>
                    <th className="p-4 w-48">Pangkat / Golongan</th>
                    <th className="p-4">Unit Kerja</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] text-gray-700">
                  {syncedEmployees.map((emp, index) => (
                    <tr key={emp.id} className="border-b hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 text-center text-gray-400 font-mono">{index + 1}</td>
                      <td className="p-4 font-bold text-blue-900 uppercase whitespace-normal">{emp.nama}</td>
                      <td className="p-4 font-mono text-gray-500">{emp.nip}</td>
                      <td className="p-4">{emp.pangkat}</td>
                      <td className="p-4 font-medium text-gray-400 uppercase text-[9px] whitespace-normal">
                          {emp.unitKerja}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center py-20">
              <p className="text-gray-400 text-sm italic font-medium">Data tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Footer - Fixed Height */}
        <div className="px-6 py-4 bg-white border-t flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs uppercase shadow-md active:scale-95 transition-all">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
