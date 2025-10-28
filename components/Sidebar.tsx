'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  Calendar,
  BookOpen,
  MapPin,
  Building2,
  Users,
  Grid3x3,
  UserCog,
  Shield,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  Menu,
  X,
  BarChart3,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Manajemen Data',
    icon: <FolderOpen className="w-5 h-5" />,
    submenu: [
      { title: 'Sekolah', href: '/manajemen-data/sekolah', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Tempat', href: '/manajemen-data/tempat', icon: <MapPin className="w-4 h-4" /> },
      { title: 'Pengurus', href: '/manajemen-data/pengurus', icon: <UserCog className="w-4 h-4" /> },
      { title: 'Siswa', href: '/data-siswa', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Habit Tracker',
    icon: <BookOpen className="w-5 h-5" />,
    submenu: [
      { title: 'Input Formulir', href: '/habit-tracker', icon: <BookOpen className="w-4 h-4" /> },
      { title: 'Kelola Link Musyrif', href: '/habit-tracker/manage-link', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Indikator Penilaian', href: '/habit-tracker/indikator', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Rekap Habit Tracker', href: '/habit-tracker/rekap', icon: <FileText className="w-4 h-4" /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Manajemen Data']);
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchLogoSekolah();
  }, []);

  const fetchLogoSekolah = async () => {
    try {
      const { data, error } = await supabase
        .from('identitas_sekolah_keasramaan')
        .select('logo')
        .limit(1)
        .single();

      if (error) {
        console.warn('Logo fetch error (using fallback icon):', error.message);
        return;
      }

      if (data?.logo) {
        if (data.logo.startsWith('http')) {
          setLogoSekolah(data.logo);
        } else {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.logo);
          if (urlData?.publicUrl) {
            setLogoSekolah(urlData.publicUrl);
          }
        }
      }
    } catch (err) {
      console.warn('Logo fetch failed (using fallback icon):', err);
    }
  };

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 min-h-screen p-6 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
      </button>

      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-2`}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-100 shrink-0">
              {logoSekolah ? (
                <img
                  src={logoSekolah}
                  alt="Logo Sekolah"
                  className="w-10 h-10 object-contain rounded-xl"
                  onError={() => setLogoSekolah('')}
                />
              ) : (
                <GraduationCap className="w-7 h-7 text-blue-600" />
              )}
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">PORTAL</h1>
                <p className="text-xs text-gray-500">KEASRAMAAN</p>
              </div>
            )}
          </div>
        </Link>
        {!isCollapsed && (
          <p className="text-sm text-blue-600 font-medium">HSI Boarding School</p>
        )}
      </div>

      <nav className="space-y-2">
        {/* Overview Section */}
        {!isCollapsed && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Overview</p>
          </div>
        )}

        <Link
          href="/"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${pathname === '/'
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-blue-50'
            }`}
          title={isCollapsed ? 'Dashboard' : ''}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Dashboard</span>}
        </Link>

        {/* Dashboard Habit Tracker */}
        <Link
          href="/overview/habit-tracker"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/overview/habit-tracker'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Dashboard Habit Tracker</span>}
        </Link>

        {/* Coming Soon Dashboards */}
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed opacity-60">
              <FileText className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-sm">Dashboard Jurnal Musyrif</span>
                <p className="text-xs text-gray-400">Coming Soon</p>
              </div>
            </div>
          </>
        )}

        {/* Manajemen Data Section */}
        {!isCollapsed && (
          <div className="mt-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Manajemen Data</p>
          </div>
        )}

        {menuItems.map((menu) => (
          <div key={menu.title}>
            <button
              onClick={() => !isCollapsed && toggleMenu(menu.title)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 transition-all`}
              title={isCollapsed ? menu.title : ''}
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
                {menu.icon}
                {!isCollapsed && <span className="font-medium">{menu.title}</span>}
              </div>
              {!isCollapsed && (
                openMenus.includes(menu.title) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              )}
            </button>

            {!isCollapsed && openMenus.includes(menu.title) && menu.submenu && (
              <div className="ml-4 mt-1 space-y-1">
                {menu.submenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${pathname === item.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
