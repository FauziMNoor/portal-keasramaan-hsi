'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import ManajemenRaporGuard from '@/components/guards/ManajemenRaporGuard';
import { FileText, Images, FileOutput, BarChart3 } from 'lucide-react';
import { ToastProvider } from '@/components/ui/ToastContainer';

const submenuItems = [
  {
    title: 'Galeri Kegiatan',
    href: '/manajemen-rapor/galeri-kegiatan',
    icon: <Images className="w-4 h-4" />,
  },
  {
    title: 'Template Rapor',
    href: '/manajemen-rapor/template-rapor',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    title: 'Generate Rapor',
    href: '/manajemen-rapor/generate-rapor',
    icon: <FileOutput className="w-4 h-4" />,
  },
  {
    title: 'Indikator & Capaian',
    href: '/manajemen-rapor/indikator-capaian',
    icon: <BarChart3 className="w-4 h-4" />,
  },
];

export default function ManajemenRaporLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ManajemenRaporGuard>
      <ToastProvider>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          
          <main className="flex-1 pt-20 lg:pt-0">
          {/* Submenu Navigation */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {submenuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      </ToastProvider>
    </ManajemenRaporGuard>
  );
}
