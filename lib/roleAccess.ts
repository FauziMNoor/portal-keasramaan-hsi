/**
 * Role-based Access Control Helper
 * Mengatur akses menu dan fitur berdasarkan role user
 */

export type UserRole = 'admin' | 'kepala_asrama' | 'musyrif' | 'guru';

// Type definitions
interface RoleAccessBase {
  dashboards: string[];
  menus: string[];
  canAccessAll: boolean;
}

interface RoleAccessLimited extends RoleAccessBase {
  habitTracker?: {
    allowedPages: string[];
  };
  catatanPerilaku?: {
    allowedPages: string[];
  };
}

type RoleAccessConfig = RoleAccessBase | RoleAccessLimited;

// Definisi akses untuk setiap role
export const roleAccess: Record<UserRole, RoleAccessConfig> = {
  admin: {
    dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
    menus: ['manajemen-data', 'habit-tracker', 'catatan-perilaku', 'manajemen-rapor'],
    canAccessAll: true,
  },
  kepala_asrama: {
    dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
    menus: ['manajemen-data', 'habit-tracker', 'catatan-perilaku', 'manajemen-rapor'],
    canAccessAll: true,
  },
  musyrif: {
    dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
    menus: ['habit-tracker', 'catatan-perilaku'],
    habitTracker: {
      allowedPages: ['/habit-tracker', '/habit-tracker/rekap'],
    },
    catatanPerilaku: {
      allowedPages: ['/catatan-perilaku/input', '/catatan-perilaku/riwayat'],
    },
    canAccessAll: false,
  },
  guru: {
    dashboards: ['data', 'habit-tracker', 'catatan-perilaku'],
    menus: ['habit-tracker', 'catatan-perilaku'],
    habitTracker: {
      allowedPages: ['/habit-tracker/rekap'],
    },
    catatanPerilaku: {
      allowedPages: ['/catatan-perilaku/input', '/catatan-perilaku/riwayat'],
    },
    canAccessAll: false,
  },
};

/**
 * Cek apakah user dengan role tertentu bisa akses path
 */
export function canAccessPath(role: UserRole, path: string): boolean {
  const access = roleAccess[role];
  
  if (!access) return false;
  if (access.canAccessAll) return true;

  // Cek dashboard access
  if (path === '/' || path === '/overview/habit-tracker' || path === '/catatan-perilaku/dashboard') {
    return true; // Semua role bisa akses dashboard
  }

  // Cek Habit Tracker access untuk guru dan musyrif
  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/habit-tracker')) {
    const limitedAccess = access as RoleAccessLimited;
    return limitedAccess.habitTracker?.allowedPages.some(allowed => path.startsWith(allowed)) || false;
  }

  // Cek Catatan Perilaku access untuk guru dan musyrif
  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/catatan-perilaku')) {
    const limitedAccess = access as RoleAccessLimited;
    return limitedAccess.catatanPerilaku?.allowedPages.some(allowed => path.startsWith(allowed)) || false;
  }

  // Guru dan Musyrif tidak bisa akses manajemen data
  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/manajemen-data')) {
    return false;
  }

  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/data-siswa')) {
    return false;
  }

  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/users')) {
    return false;
  }

  // HANYA Admin dan Kepala Asrama yang bisa akses Manajemen Rapor
  if ((role === 'guru' || role === 'musyrif') && path.startsWith('/manajemen-rapor')) {
    return false;
  }

  return false;
}

/**
 * Cek apakah user bisa akses menu Manajemen Rapor
 * Hanya Admin dan Kepala Asrama yang diizinkan
 */
export function canAccessManajemenRapor(role: UserRole): boolean {
  return role === 'admin' || role === 'kepala_asrama';
}

/**
 * Get allowed menu items untuk role tertentu
 */
export function getAllowedMenus(role: UserRole) {
  const access = roleAccess[role];
  if (!access) return [];
  return access.menus;
}
