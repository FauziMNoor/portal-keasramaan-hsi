'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { CheckCircle, FileText, Link2, BarChart3, Clock, Settings } from 'lucide-react';

export default function KepulanganPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || '');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Approval Perizinan',
      description: 'Review dan approve perizinan kepulangan santri',
      icon: CheckCircle,
      href: '/perizinan/kepulangan/approval',
      roles: ['admin', 'kepala_asrama', 'kepala_sekolah'],
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Konfirmasi Kepulangan',
      description: 'Tracking santri yang sudah kembali ke asrama',
      icon: Clock,
      href: '/perizinan/kepulangan/konfirmasi-kepulangan',
      roles: ['admin', 'kepala_asrama', 'kepala_sekolah'],
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Rekap Perizinan',
      description: 'Lihat laporan dan statistik perizinan kepulangan',
      icon: BarChart3,
      href: '/perizinan/kepulangan/rekap',
      roles: ['admin', 'kepala_asrama', 'kepala_sekolah'],
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Manage Link Perizinan',
      description: 'Kelola token link untuk wali santri',
      icon: Link2,
      href: '/perizinan/kepulangan/manage-link',
      roles: ['admin', 'kepala_sekolah'],
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Form Perizinan',
      description: 'Lihat form perizinan yang sudah diajukan',
      icon: FileText,
      href: '/perizinan/kepulangan/form',
      roles: ['admin', 'kepala_sekolah'],
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Perizinan Kepulangan</h1>
            <p className="text-gray-600">Kelola perizinan kepulangan santri</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 text-left hover:scale-105 transform"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </button>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-2">💡 Informasi</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <span className="font-semibold">Approval Perizinan</span>: Review dan approve perizinan dari wali santri</li>
              <li>• <span className="font-semibold">Konfirmasi Kepulangan</span>: Tracking santri yang sudah kembali ke asrama</li>
              <li>• <span className="font-semibold">Rekap Perizinan</span>: Lihat statistik dan laporan perizinan</li>
              <li>• <span className="font-semibold">Manage Link</span>: Kelola token untuk form perizinan</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
