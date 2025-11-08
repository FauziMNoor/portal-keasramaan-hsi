'use client';

import Sidebar from '@/components/Sidebar';
import { FileText, Clock } from 'lucide-react';

export default function ManajemenRaporPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
                <FileText className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Manajemen Rapor
            </h1>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full mb-6">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Akan Segera Tersedia</span>
            </div>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Fitur Manajemen Rapor sedang dalam tahap pengembangan dan akan segera hadir untuk membantu Anda mengelola rapor siswa dengan lebih mudah dan efisien.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Template Rapor</h3>
                <p className="text-sm text-gray-600">Buat dan kelola template rapor kustom</p>
              </div>

              <div className="p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Generate Rapor</h3>
                <p className="text-sm text-gray-600">Generate rapor otomatis untuk siswa</p>
              </div>

              <div className="p-6 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Arsip Rapor</h3>
                <p className="text-sm text-gray-600">Kelola dan akses arsip rapor siswa</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Untuk informasi lebih lanjut, silakan hubungi administrator sistem.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
