'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Settings, Link as LinkIcon, FileText, BarChart3 } from 'lucide-react';

export default function JurnalMusyrifPage() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Setup Jurnal',
      description: 'Kelola Sesi, Jadwal, dan Kegiatan',
      icon: Settings,
      color: 'from-indigo-500 to-indigo-600',
      path: '/jurnal-musyrif/setup',
    },
    {
      title: 'Manage Link',
      description: 'Kelola link akses untuk musyrif',
      icon: LinkIcon,
      color: 'from-blue-500 to-blue-600',
      path: '/jurnal-musyrif/manage-link',
    },
    {
      title: 'Rekap Jurnal',
      description: 'Lihat hasil inputan jurnal musyrif',
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      path: '/jurnal-musyrif/rekap',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-3 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Jurnal Musyrif</h1>
                <p className="text-xs sm:text-base text-gray-600">Sistem pencatatan aktivitas harian musyrif</p>
              </div>
            </div>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6 text-left group active:scale-95"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{item.title}</h2>
                <p className="text-xs sm:text-base text-gray-600">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
