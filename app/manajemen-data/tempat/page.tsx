'use client';

import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { MapPin, Building2, Users, Grid3x3, ChevronRight } from 'lucide-react';

export default function ManajemenTempatPage() {
  const menuItems = [
    {
      title: 'Lokasi',
      description: 'Kelola data lokasi sekolah (Sukabumi, Bogor, dll)',
      href: '/lokasi',
      icon: <MapPin className="w-8 h-8" />,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Asrama',
      description: 'Kelola data asrama dan gedung',
      href: '/asrama',
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Kelas',
      description: 'Kelola data kelas (10, 11, 12)',
      href: '/kelas',
      icon: <Users className="w-8 h-8" />,
      color: 'from-teal-500 to-teal-600',
    },
    {
      title: 'Rombel',
      description: 'Kelola data rombongan belajar',
      href: '/rombel',
      icon: <Grid3x3 className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Data Tempat</h1>
            <p className="text-gray-600">Kelola data lokasi, asrama, kelas, dan rombel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center text-blue-600 font-medium text-sm">
                  <span>Kelola Data</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
