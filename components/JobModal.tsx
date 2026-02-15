
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');

  if (!isOpen) return null;

  const jobOptions = [
    'Analis Kebijakan Ahli Madya',
    'Analis Kebijakan Ahli Muda',
    'Analis Kebijakan Ahli Utama',
    'Analis Kebijakan Pertama',
    'Analis Keuangan',
    'Analis Perencanaan',
  ].filter(job => job.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in mx-4">
        {/* Modal Header */}
        <div className="bg-sky-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-medium text-lg">Tambah Jabatan Pelaksana</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-sm">
               <label className="font-medium text-gray-700 md:text-right">Unit Kerja :</label>
               <div className="md:col-span-3 text-gray-800 font-medium uppercase">BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-sm">
               <label className="font-medium text-gray-700 md:text-right">Sub Unit Kerja :</label>
               <div className="md:col-span-3 text-gray-800 font-medium uppercase">Sub Bagian Perencanaan</div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="bg-sky-500 text-white px-4 py-2 text-xs font-bold inline-block rounded-t-md">
                    + Jabatan Fungsional/Pelaksana
                </div>
                <div className="border border-sky-500 p-4 bg-sky-50/30 rounded-b-md rounded-tr-md">
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-white bg-sky-600 p-2 rounded-t text-center">
                        <div className="col-span-4">Jenis Jabatan</div>
                        <div className="col-span-6">Nama Jabatan</div>
                        <div className="col-span-1">Jumlah ABK</div>
                        <div className="col-span-1">Aksi</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 p-2 border border-t-0 border-gray-200 items-start bg-white">
                        <div className="col-span-4">
                            <select className="w-full border border-gray-300 rounded p-1.5 text-xs text-gray-700 focus:ring-1 focus:ring-sky-500 outline-none">
                                <option>Jabatan Fungsional</option>
                                <option>Jabatan Pelaksana</option>
                            </select>
                        </div>
                        <div className="col-span-6 relative">
                             <input 
                                type="text"
                                className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                                placeholder=":: Pilihan ::"
                                value={selectedJob || searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedJob('');
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                             />
                             {showDropdown && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 max-h-40 overflow-y-auto shadow-lg rounded text-xs">
                                    {jobOptions.map((job, idx) => (
                                        <div 
                                            key={idx} 
                                            className="p-2 hover:bg-sky-50 cursor-pointer text-gray-700"
                                            onClick={() => {
                                                setSelectedJob(job);
                                                setSearchTerm(job);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            {job}
                                        </div>
                                    ))}
                                    {jobOptions.length === 0 && (
                                        <div className="p-2 text-gray-400 italic">Tidak ditemukan</div>
                                    )}
                                </div>
                             )}
                        </div>
                        <div className="col-span-1">
                             <input type="number" className="w-full border border-gray-300 rounded p-1.5 text-xs text-center" defaultValue={1} />
                        </div>
                        <div className="col-span-1 flex justify-center">
                             <button className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                                 <X size={14} />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
             onClick={onClose}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm"
          >
            <Save size={16} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
