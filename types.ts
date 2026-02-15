
import React from 'react';

export interface JobPosition {
  id: number;
  jenisJabatan: string;
  jabatan: string;
  kelasJabatan: number;
  pendidikan: string;
  jurusan: string;
  jumlahABK: number;
  ketersediaan: number;
  kebutuhan: number;
  status: 'SESUAI' | 'KURANG' | 'LEBIH';
  unitKerja?: string;
  periodeUpdate?: string;
}

export interface Employee {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  pangkat: string;
  golongan: string;
}

export interface EmployeeHistory {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  status: 'Mutasi' | 'CTLN' | 'Promosi' | 'Pensiun' | 'Tubel';
  tanggal: string;
  keterangan: string;
}

export interface StatCardProps {
  title: string;
  count: number;
  color: 'blue' | 'green' | 'gray' | 'orange';
  kebutuhan?: number;
  kekurangan?: number;
  icon: React.ElementType;
}

export type ViewState = 'dashboard' | 'peta' | 'histori' | 'database';
