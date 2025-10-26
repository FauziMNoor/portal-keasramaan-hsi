'use client';

import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Data Sekolah',
    icon: <GraduationCap className="w-5 h-5" />,
    submenu: [
      { title: 'Identitas Sekolah', href: '/identitas-sekolah', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Tahun Ajaran', href: '/tahun-ajaran', icon: <Calendar className="w-4 h-4" /> },
      { title: 'Semester', href: '/semester', icon: <BookOpen className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Data Tempat',
    icon: <MapPin className="w-5 h-5" />,
    submenu: [
      { title: 'Lokasi', href: '/lokasi', icon: <MapPin className="w-4 h-4" /> },
      { title: 'Asrama', href: '/asrama', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Kelas', href: '/kelas', icon: <Users className="w-4 h-4" /> },
      { title: 'Rombel', href: '/rombel', icon: <Grid3x3 className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Data Pengurus',
    icon: <UserCog className="w-5 h-5" />,
    submenu: [
      { title: 'Kepala Asrama', href: '/kepala-asrama', icon: <Shield className="w-4 h-4" /> },
      { title: 'Musyrif', href: '/musyrif', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Data Siswa',
    icon: <Users className="w-5 h-5" />,
    submenu: [
      { title: 'Input Data Siswa', href: '/data-siswa', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Habit Tracker',
    icon: <BookOpen className="w-5 h-5" />,
    submenu: [
      { title: 'Input Formulir', href: '/habit-tracker', icon: <BookOpen className="w-4 h-4" /> },
      { title: 'Kelola Link Musyrif', href: '/habit-tracker/manage-link', icon: <Building2 className="w-4 h-4" /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Data Sekolah', 'Data Tempat', 'Data Pengurus']);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-8">
        <Link href="/">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">PORTAL</h1>
              <p className="text-xs text-gray-500">KEASRAMAAN</p>
            </div>
          </div>
        </Link>
        <p className="text-sm text-blue-600 font-medium">HSI Boarding School</p>
      </div>

      <nav className="space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname === '/'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-blue-50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>

        {menuItems.map((menu) => (
          <div key={menu.title}>
            <button
              onClick={() => toggleMenu(menu.title)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center gap-3">
                {menu.icon}
                <span className="font-medium">{menu.title}</span>
              </div>
              {openMenus.includes(menu.title) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {openMenus.includes(menu.title) && menu.submenu && (
              <div className="ml-4 mt-1 space-y-1">
                {menu.submenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                      pathname === item.href
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
