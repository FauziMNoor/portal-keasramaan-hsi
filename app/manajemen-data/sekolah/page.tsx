'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Building2, Calendar, BookOpen, ChevronRight } from 'lucide-react';

export default function ManajemenSekolahPage() {
  const menuItems = [
    {
      title: 'Identitas Sekolah',
      description: 'Kelola informasi identitas dan profil sekolah',
      href: '/identitas-sekolah',
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Tahun Ajaran',
      description: 'Kelola data tahun ajaran aktif dan arsip',
      href: '/tahun-ajaran',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Semester',
      description: 'Kelola data semester ganjil dan genap',
      href: '/semester',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Data Sekolah</h1>
            <p className="text-gray-600">Kelola data identitas sekolah, tahun ajaran, dan semester</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
