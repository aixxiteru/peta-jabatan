
import { JobPosition, EmployeeHistory, Employee } from './types';

export const jobPositions: JobPosition[] = [
  {
    id: 1,
    jenisJabatan: "JPT PRATAMA",
    jabatan: "KEPALA BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI",
    kelasJabatan: 16,
    pendidikan: "S-2 / S-3",
    jurusan: "Teknik / Manajemen / Kebijakan Publik",
    jumlahABK: 1,
    ketersediaan: 1,
    kebutuhan: 1,
    status: 'SESUAI'
  },
  {
    id: 2,
    jenisJabatan: "ADMINISTRATOR",
    jabatan: "SEKRETARIS BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI",
    kelasJabatan: 12,
    pendidikan: "S-1 / S-2",
    jurusan: "Semua Jurusan",
    jumlahABK: 1,
    ketersediaan: 1,
    kebutuhan: 1,
    status: 'SESUAI'
  },
  {
    id: 3,
    jenisJabatan: "PENGAWAS",
    jabatan: "KEPALA SUBBAGIAN PERENCANAAN",
    kelasJabatan: 9,
    pendidikan: "S-1 Ekonomi / Akuntansi",
    jurusan: "Ekonomi / Manajemen",
    jumlahABK: 1,
    ketersediaan: 1,
    kebutuhan: 1,
    status: 'SESUAI'
  },
  {
    id: 4,
    jenisJabatan: "PENGAWAS",
    jabatan: "KEPALA SUBBAGIAN KEUANGAN DAN ASET",
    kelasJabatan: 9,
    pendidikan: "S-1 Akuntansi",
    jurusan: "Akuntansi",
    jumlahABK: 1,
    ketersediaan: 1,
    kebutuhan: 1,
    status: 'SESUAI'
  },
  {
    id: 5,
    jenisJabatan: "PENGAWAS",
    jabatan: "KEPALA SUBBAGIAN UMUM DAN KEPEGAWAIAN",
    kelasJabatan: 9,
    pendidikan: "S-1 Hukum / Sosial",
    jurusan: "Hukum / Administrasi Negara",
    jumlahABK: 1,
    ketersediaan: 1,
    kebutuhan: 1,
    status: 'SESUAI'
  },
  {
    id: 6,
    jenisJabatan: "JABATAN FUNGSIONAL",
    jabatan: "ANALIS KEBIJAKAN AHLI MADYA",
    kelasJabatan: 12,
    pendidikan: "S-1/ Sarjana, S-2",
    jurusan: "Semua Jurusan",
    jumlahABK: 10,
    ketersediaan: 8,
    kebutuhan: 10,
    status: 'KURANG'
  },
  {
    id: 7,
    jenisJabatan: "JABATAN FUNGSIONAL",
    jabatan: "ANALIS KEBIJAKAN AHLI MUDA",
    kelasJabatan: 9,
    pendidikan: "S-1/ Sarjana",
    jurusan: "Semua Jurusan",
    jumlahABK: 15,
    ketersediaan: 12,
    kebutuhan: 15,
    status: 'KURANG'
  },
  {
    id: 8,
    jenisJabatan: "JABATAN FUNGSIONAL",
    jabatan: "PERENCANA AHLI MUDA",
    kelasJabatan: 9,
    pendidikan: "S-1 Ekonomi / Teknik / Manajemen",
    jurusan: "Perencanaan / Ekonomi Pembangunan",
    jumlahABK: 4,
    ketersediaan: 2,
    kebutuhan: 4,
    status: 'KURANG'
  },
  {
    id: 9,
    jenisJabatan: "JABATAN FUNGSIONAL",
    jabatan: "ANALIS SUMBER DAYA MANUSIA APARATUR AHLI MUDA",
    kelasJabatan: 9,
    pendidikan: "S-1 Hukum / Psikologi",
    jurusan: "Manajemen SDM",
    jumlahABK: 2,
    ketersediaan: 2,
    kebutuhan: 2,
    status: 'SESUAI'
  },
  {
    id: 10,
    jenisJabatan: "JABATAN PELAKSANA",
    jabatan: "PENGADMINISTRASI UMUM",
    kelasJabatan: 5,
    pendidikan: "SLTA / Sederajat",
    jurusan: "Semua Jurusan",
    jumlahABK: 10,
    ketersediaan: 12,
    kebutuhan: 10,
    status: 'LEBIH'
  }
];

export const employees: Employee[] = [
  {
    id: 1,
    nama: "Emmy Suryandari, S.T., M.T.",
    nip: "19720115 199803 2 001",
    jabatan: "KEPALA BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI",
    unitKerja: "BSKJI",
    pangkat: "Pembina Utama Madya",
    golongan: "IV/d"
  },
  {
    id: 2,
    nama: "Yan Sibarang Tandiele, S.T., M.T.",
    nip: "19750512 200003 1 002",
    jabatan: "SEKRETARIS BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI",
    unitKerja: "BSKJI",
    pangkat: "Pembina Utama Muda",
    golongan: "IV/c"
  }
];

export const employeeHistory: EmployeeHistory[] = [
  {
    id: 1,
    nama: "Budi Santoso, S.T.",
    nip: "19850101 201001 1 001",
    jabatan: "Analisis Kebijakan Ahli Muda",
    unitKerja: "BSKJI",
    status: "Promosi",
    tanggal: "2023-11-01",
    keterangan: "Promosi Jabatan"
  }
];

export const chartData = [
  { name: 'Struktural', Ketersediaan: 5, Kebutuhan: 5, Kekurangan: 0 },
  { name: 'Fungsional', Ketersediaan: 25, Kebutuhan: 34, Kekurangan: 9 },
  { name: 'Pelaksana', Ketersediaan: 22, Kebutuhan: 21, Kekurangan: 0 },
];
