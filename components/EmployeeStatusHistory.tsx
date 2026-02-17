
import React, { useEffect, useState } from 'react';
import { History, Search, Filter } from 'lucide-react';

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1GfE_sn4ATSf0r0t6dn1WymuScWF-HzIxLYdmnGJx8FA/export?format=csv&gid=894669172';

type HistoryRow = {
  id: number;
  nama?: string;
  nip?: string;
  jabatan?: string;
  unitKerja?: string;
  status?: string;
  b?: string;
  tanggal?: string;
  keterangan?: string;
  sk?: string;
  [k: string]: any;
};

function parseCSV(text: string) {
  const cleaned = text.replace(/\r/g, '').replace(/^\uFEFF/, '');
  const lines = cleaned.split('\n').filter(l => l.trim() !== '');
  function parseLine(line: string) {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  }
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).map((line) => {
    const cols = parseLine(line).map(c => c.replace(/^"|"$/g, ''));
    const obj: Record<string,string> = {};
    headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

function headerToKey(header: string) {
  const h = header.toLowerCase();
  if (h.includes('nama')) return 'nama';
  if (h.includes('nip')) return 'nip';
  if (h.includes('jabatan')) return 'jabatan';
  if (h.includes('unit')) return 'unitKerja';
  if (h === 'b') return 'b';
  if (h.includes('status')) return 'status';
  if (h.includes('tanggal') || h.includes('date')) return 'tanggal';
  if (h.includes('keterangan')) return 'keterangan';
  if (h === 'sk' || h.includes('sk')) return 'sk';
  return header.replace(/\s+/g, '_');
}

export const EmployeeStatusHistory: React.FC = () => {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [bFilter, setBFilter] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(SHEET_CSV_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = parseCSV(text);
        if (!parsed.rows || parsed.rows.length === 0) {
          if (mounted) setRows([]);
          return;
        }
        const headers = parsed.headers;
        const mapped = parsed.rows.map((r: Record<string,string>, idx: number) => {
          const target: HistoryRow = { id: idx + 1 };
          headers.forEach(h => {
            const key = headerToKey(h);
            target[key] = r[h];
          });
          return target;
        });
        if (mounted) setRows(mapped);
      } catch (e: any) {
        if (mounted) setError(e.message ?? 'Gagal memuat data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredRows = rows.filter(item => {
    const keyword = searchQuery.toLowerCase();
    const matchNama = !searchQuery || (item.nama?.toLowerCase().includes(keyword));
    const matchSK = !searchQuery || (item.sk?.toLowerCase().includes(keyword));
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchB = !bFilter || item.b === bFilter;
    // Search bar: cocokkan jika keyword ada di nama atau SK
    return (matchNama || matchSK) && matchStatus && matchB;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 border-l-4 border-blue-600 shadow-sm mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-2 sm:mb-0">
            <History size={20} className="text-blue-600" />
            LOG STATUS PEGAWAI
        </h2>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-2">
          <div className="relative w-full sm:w-auto">
            <select
              className={`w-full sm:w-auto border border-gray-300 rounded text-xs px-2 py-1 text-gray-900 ${statusFilter ? 'bg-blue-100' : 'bg-white'}`}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Promosi">Promosi</option>
              <option value="Mutasi">Mutasi</option>
              <option value="CTLN">CTLN</option>
              <option value="Tubel">Tubel</option>
              <option value="Tugas">Tugas</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className={`w-full sm:w-auto border border-gray-300 rounded text-xs px-2 py-1 text-gray-900 ${bFilter ? 'bg-blue-100' : 'bg-white'}`}
              value={bFilter}
              onChange={e => setBFilter(e.target.value)}
            >
              <option value="" style={{ color: '#a3a3a3' }}>Filter Perubahan</option>
              <option value="+1">+1</option>
              <option value="-1">-1</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Cari Pegawai atau SK..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 md:w-64 pl-8 pr-4 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900 placeholder-gray-400 shadow-sm"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold w-32 sticky left-0 z-10 bg-blue-600" style={{ width: 100, minWidth: 180, maxWidth: 200 }}>Nama Pegawai</th>
                <th className="p-4 font-semibold">NIP</th>
                <th className="p-4 font-semibold w-80" style={{ width: 200, minWidth: 200, maxWidth: 300 }}>Jabatan</th>
                <th className="p-4 font-semibold">Unit Kerja</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">B</th>
                <th className="p-4 font-semibold text-center">Tanggal</th>
                <th className="p-4 font-semibold text-center" style={{ width: 180, minWidth: 150, maxWidth: 250 }}>SK</th>
                <th className="p-4 font-semibold" style={{ width: 300, minWidth: 180, maxWidth: 400 }}>Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
              {filteredRows.map((item, index) => (
                <tr key={item.id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors border-b border-gray-100">
                  <td className="p-4 text-center border-r border-gray-200">{index + 1}</td>
                  <td
                    className={
                      `p-4 font-medium border-r border-gray-200 w-32 sticky left-0 ` +
                      ` ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ` +
                      `group-hover:bg-blue-50 transition-colors`
                    }
                    style={{ width: 120, minWidth: 120, maxWidth: 120 }}
                  >
                    {item.nama || '-'}
                  </td>
                  <td className="p-4 border-r border-gray-200 whitespace-nowrap">{item.nip || '-'}</td>
                  <td className="p-4 border-r border-gray-200">{item.jabatan || '-'}</td>
                  <td className="p-4 border-r border-gray-200 font-semibold">{item.unitKerja || '-'}</td>
                  <td className="p-4 text-center border-r border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'Mutasi' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      item.status === 'Promosi' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.status === 'CTLN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      item.status === 'Tubel' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.status || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center border-r border-gray-200">
                    {item.b === '-1' ? (
                      <span className="text-red-600 font-bold">{item.b}</span>
                    ) : item.b === '+1' ? (
                      <span className="text-green-600 font-bold">{item.b}</span>
                    ) : (
                      <span className="font-bold">{item.b || '-'}</span>
                    )}
                  </td>
                  <td className="p-4 text-center border-r border-gray-200 whitespace-nowrap">{item.tanggal || '-'}</td>
                  <td className="p-4 text-left border-r border-gray-200" style={{ width: 180, minWidth: 150, maxWidth: 250 }}>{item.sk || '-'}</td>
                  <td className="p-4" style={{ width: 300, minWidth: 180, maxWidth: 400 }}>{item.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-6 text-center text-gray-500">Memuat data...</div>
        )}

        {!loading && error && (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        )}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">Tidak ada data histori tersedia.</div>
        )}
      </div>
    </div>
  );
};
