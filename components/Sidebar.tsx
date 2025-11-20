'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  FileText,
  LogOut,
  User,
  ClipboardList,
  Link as LinkIcon,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
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
      { title: 'Users', href: '/users', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Habit Tracker',
    icon: <BookOpen className="w-5 h-5" />,
    submenu: [
      { title: 'Input Formulir', href: '/habit-tracker', icon: <BookOpen className="w-4 h-4" /> },
      { title: 'Kelola Link Musyrif/ah', href: '/habit-tracker/manage-link', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Laporan Wali Santri', href: '/habit-tracker/laporan', icon: <FileText className="w-4 h-4" /> },
      { title: 'Indikator Penilaian', href: '/habit-tracker/indikator', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Rekap Habit Tracker', href: '/habit-tracker/rekap', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Catatan Perilaku',
    icon: <FileText className="w-5 h-5" />,
    submenu: [
      { title: 'Input Catatan', href: '/catatan-perilaku/input', icon: <FileText className="w-4 h-4" /> },
      { title: 'Kelola Link Token', href: '/catatan-perilaku/manage-link', icon: <Building2 className="w-4 h-4" /> },
      { title: 'Riwayat Catatan', href: '/catatan-perilaku/riwayat', icon: <BookOpen className="w-4 h-4" /> },
      { title: 'Kelola Kategori', href: '/catatan-perilaku/kategori', icon: <Grid3x3 className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Manajemen Rapor',
    icon: <ClipboardList className="w-5 h-5" />,
    href: '/manajemen-rapor',
  },
  {
    title: 'Perizinan',
    icon: <FileText className="w-5 h-5" />,
    submenu: [
      { title: 'Izin Kepulangan', href: '/perizinan/kepulangan', icon: <CheckCircle className="w-4 h-4" /> },
      { title: 'Kelola Link Perizinan', href: '/perizinan/kepulangan/manage-link', icon: <LinkIcon className="w-4 h-4" /> },
      { title: 'Approval Perizinan', href: '/perizinan/kepulangan/approval', icon: <CheckCircle className="w-4 h-4" /> },
      { title: 'Rekap Perizinan', href: '/perizinan/kepulangan/rekap', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },

];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Manajemen Data']);
  const [logoSekolah, setLogoSekolah] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchLogoSekolah();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user?.role || '');
      }
    } catch (error) {
      console.error('Fetch user role error:', error);
    }
  };

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

  // Filter menu berdasarkan role
  const getFilteredMenuItems = () => {
    if (userRole === 'guru' || userRole === 'musyrif') {
      // Guru dan Musyrif hanya bisa akses Habit Tracker dan Catatan Perilaku dengan submenu terbatas
      // TIDAK BISA akses Manajemen Data
      return menuItems
        .filter(menu => 
          menu.title === 'Habit Tracker' || menu.title === 'Catatan Perilaku'
        )
        .map(menu => {
          if (menu.title === 'Habit Tracker') {
            return {
              ...menu,
              submenu: menu.submenu?.filter(item => 
                item.href === '/habit-tracker' || // Input Formulir
                item.href === '/habit-tracker/rekap'
              )
            };
          }
          if (menu.title === 'Catatan Perilaku') {
            return {
              ...menu,
              submenu: menu.submenu?.filter(item => 
                item.href === '/catatan-perilaku/input' || 
                item.href === '/catatan-perilaku/riwayat'
              )
            };
          }
          return menu;
        });
    }
    // Role lain (admin, kepala_asrama, kepala_sekolah) bisa akses semua menu
    return menuItems;
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-3 shadow-lg transition-all"
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300
        
        /* Mobile: Fixed position with slide animation */
        fixed lg:relative
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40
      `}>
        {/* Toggle Button - Desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block absolute -right-3 top-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-all z-10"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
        </button>

        {/* Header - Fixed */}
        <div className="p-6 pb-4 shrink-0">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
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

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {/* Overview Section */}
          {!isCollapsed && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Overview</p>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${pathname === '/'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-blue-50'
              }`}
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium">Dashboard Data</span>}
          </Link>

          {/* Dashboard Habit Tracker - Semua role bisa akses */}
          <Link
            href="/overview/habit-tracker"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/overview/habit-tracker'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Dashboard Habit Tracker</span>}
          </Link>

          {/* Dashboard Catatan Perilaku - Semua role bisa akses */}
          <Link
            href="/catatan-perilaku/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/catatan-perilaku/dashboard'
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Dashboard Catatan Perilaku</span>}
          </Link>

          {/* Dashboard Perizinan Kepulangan - Semua role bisa akses */}
          <Link
            href="/perizinan/kepulangan/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/perizinan/kepulangan/dashboard'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Dashboard Perizinan</span>}
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

          {/* Manajemen Data Section - Hanya tampil jika bukan role guru atau musyrif */}
          {!isCollapsed && userRole !== 'guru' && userRole !== 'musyrif' && (
            <div className="mt-6 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">Manajemen Data</p>
            </div>
          )}

          {filteredMenuItems.map((menu) => (
            <div key={menu.title}>
              {menu.submenu ? (
                <>
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

                  {!isCollapsed && openMenus.includes(menu.title) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {menu.submenu.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
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
                </>
              ) : (
                <Link
                  href={menu.href || '#'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all ${pathname === menu.href
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  title={isCollapsed ? menu.title : ''}
                >
                  {menu.icon}
                  {!isCollapsed && <span className="font-medium">{menu.title}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout - Fixed di bagian bawah */}
        {!isCollapsed && (
          <div className="p-6 pt-4 border-t border-gray-200 bg-white shrink-0">
            <UserProfile />
          </div>
        )}
      </aside>
    </>
  );
}

// Component User Profile dengan Logout
function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Yakin ingin logout?')) return;

    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Gagal logout. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Get foto URL
  const getFotoUrl = (foto: string | null) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    const { data } = supabase.storage.from('user-photos').getPublicUrl(foto);
    return data.publicUrl;
  };

  const fotoUrl = getFotoUrl(user.foto);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-md">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={user.nama}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">
              {user.nama.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user.nama}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.role}
          </p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
