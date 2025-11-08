/**
 * Manajemen Rapor Access Guard
 * 
 * Komponen ini melindungi halaman Manajemen Rapor agar hanya bisa diakses
 * oleh role ADMIN dan KEPALA ASRAMA saja.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle } from 'lucide-react';

interface ManajemenRaporGuardProps {
  children: React.ReactNode;
}

export default function ManajemenRaporGuard({ children }: ManajemenRaporGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/auth/me');
      
      if (!res.ok) {
        // User tidak terautentikasi
        router.push('/login');
        return;
      }

      const data = await res.json();
      const role = data.user?.role || '';
      setUserRole(role);

      // Hanya Admin dan Kepala Asrama yang diizinkan
      const allowedRoles = ['admin', 'kepala_asrama'];
      const hasAccess = allowedRoles.includes(role.toLowerCase());

      if (!hasAccess) {
        setIsAuthorized(false);
        // Redirect ke dashboard setelah 3 detik
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Access check error:', error);
      router.push('/login');
    }
  };

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Akses Ditolak
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">
                  Anda tidak memiliki izin untuk mengakses halaman ini
                </p>
                <p className="text-xs text-red-700">
                  Halaman <strong>Manajemen Rapor</strong> hanya dapat diakses oleh:
                </p>
                <ul className="text-xs text-red-700 mt-2 ml-4 list-disc">
                  <li>Admin</li>
                  <li>Kepala Asrama</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 text-center">
              Role Anda saat ini: <span className="font-semibold text-gray-900">{userRole || 'Tidak diketahui'}</span>
            </p>
          </div>

          <p className="text-sm text-gray-500 text-center mb-4">
            Anda akan diarahkan ke dashboard dalam beberapa detik...
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}
