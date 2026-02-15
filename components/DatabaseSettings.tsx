
import React, { useState, useEffect } from 'react';
import { Database, Link, Save, CheckCircle2, AlertCircle, Info, Hash, Lock } from 'lucide-react';

export const DatabaseSettings: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [employeeGid, setEmployeeGid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1GfE_sn4ATSf0r0t6dn1WymuScWF-HzIxLYdmnGJx8FA/edit?gid=1142006045#gid=1142006045';
  const DEFAULT_EMPLOYEE_GID = '208853000';
  const SECRET_PASSWORD = 'alambskji';

  useEffect(() => {
    const savedUrl = localStorage.getItem('google_sheet_url');
    const savedGid = localStorage.getItem('google_employee_gid');
    setSheetUrl(savedUrl || DEFAULT_SHEET_URL);
    setEmployeeGid(savedGid || DEFAULT_EMPLOYEE_GID);
  }, []);

  const handleSave = async () => {
    if (!sheetUrl) {
      setErrorMsg('Harap masukkan URL Google Sheet yang valid.');
      setStatus('error');
      return;
    }

    if (password !== SECRET_PASSWORD) {
      setErrorMsg('Password salah! Anda tidak memiliki akses untuk mengubah konfigurasi.');
      setStatus('error');
      return;
    }

    setIsSaving(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
        throw new Error('URL tidak valid. Pastikan link berasal dari Google Sheets.');
      }

      localStorage.setItem('google_sheet_url', sheetUrl);
      localStorage.setItem('google_employee_gid', employeeGid || DEFAULT_EMPLOYEE_GID);
      
      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      setStatus('success');
      setPassword(''); // Reset password field after success
      setTimeout(() => setStatus('idle'), 3000);
      
      window.dispatchEvent(new Event('storage'));
      // Trigger sync event
      window.dispatchEvent(new Event('storage_sync_complete'));
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded shadow-sm border-t-4 border-blue-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Konfigurasi Database</h2>
            <p className="text-sm text-gray-500">Atur link sumber data Peta Jabatan dan Nama Pegawai</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <Info size={20} className="text-blue-500 shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-bold mb-1">Cara Konfigurasi Nama Pegawai:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Buka Sheet Anda, klik tab subsheet <strong>"Data Pegawai_202602"</strong>.</li>
                <li>Lihat URL di browser, cari angka setelah <code>gid=</code> (misal: <code>gid=123456</code>).</li>
                <li>Masukkan angka tersebut ke kolom <strong>GID Subsheet</strong> di bawah.</li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Link size={16} /> URL Utama Google Sheet:
                </label>
                <input 
                type="text" 
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-white text-gray-900 font-mono text-[11px]"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash size={16} /> GID Pegawai:
                </label>
                <input 
                type="text" 
                value={employeeGid}
                onChange={(e) => setEmployeeGid(e.target.value)}
                placeholder="Contoh: 0"
                className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner bg-white text-gray-900 font-mono"
                />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="max-w-xs space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Lock size={16} className="text-amber-500" /> Password Akses:
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password untuk menyimpan"
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-inner bg-white text-gray-900"
                />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-2.5 rounded text-white font-bold text-sm shadow-md transition-all ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              <Save size={18} />
              {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-fade-in">
                <CheckCircle2 size={18} /> Konfigurasi Berhasil Disimpan!
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-rose-600 text-sm font-bold animate-fade-in">
                <AlertCircle size={18} /> {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
