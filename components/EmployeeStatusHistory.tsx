
import React from 'react';
import { History, Search, Filter } from 'lucide-react';
import { employeeHistory } from '../mockData';

export const EmployeeStatusHistory: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 border-l-4 border-blue-600 shadow-sm mb-6 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            HISTORI STATUS PEGAWAI
        </h2>
        <div className="flex gap-2">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Cari Pegawai..." 
                    className="pl-8 pr-4 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none w-48 md:w-64 bg-white text-gray-900 placeholder-gray-400 shadow-sm"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded border border-gray-300 transition-colors">
                <Filter size={16} />
            </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold w-12 text-center">No</th>
                <th className="p-4 font-semibold">Nama Pegawai</th>
                <th className="p-4 font-semibold">NIP</th>
                <th className="p-4 font-semibold">Jabatan</th>
                <th className="p-4 font-semibold">Unit Kerja</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Tanggal</th>
                <th className="p-4 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
              {employeeHistory.map((item, index) => (
                <tr key={item.id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors border-b border-gray-100">
                  <td className="p-4 text-center border-r border-gray-200">{index + 1}</td>
                  <td className="p-4 font-medium border-r border-gray-200 whitespace-nowrap">{item.nama}</td>
                  <td className="p-4 border-r border-gray-200 whitespace-nowrap">{item.nip}</td>
                  <td className="p-4 border-r border-gray-200">{item.jabatan}</td>
                  <td className="p-4 border-r border-gray-200 font-semibold">{item.unitKerja}</td>
                  <td className="p-4 text-center border-r border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'Mutasi' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      item.status === 'Promosi' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.status === 'CTLN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      item.status === 'Tubel' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center border-r border-gray-200 whitespace-nowrap">{item.tanggal}</td>
                  <td className="p-4">{item.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {employeeHistory.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic">Tidak ada data histori tersedia.</div>
        )}
      </div>
    </div>
  );
};
