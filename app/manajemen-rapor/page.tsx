'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManajemenRaporPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman Galeri Kegiatan sebagai default
    router.push('/manajemen-rapor/galeri-kegiatan');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
