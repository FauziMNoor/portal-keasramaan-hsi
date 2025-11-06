'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { canAccessPath, UserRole } from '@/lib/roleAccess';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Component untuk proteksi halaman berdasarkan role
 * Jika user tidak memiliki akses, akan redirect ke halaman yang ditentukan
 */
export default function RoleGuard({ 
  children, 
  allowedRoles,
  redirectTo = '/' 
}: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      const userRole = data.user?.role as UserRole;

      // Jika tidak ada allowedRoles, berarti semua role bisa akses
      if (!allowedRoles || allowedRoles.length === 0) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // Cek apakah role user ada di allowedRoles
      if (allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        // Redirect jika tidak punya akses
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Access check error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
