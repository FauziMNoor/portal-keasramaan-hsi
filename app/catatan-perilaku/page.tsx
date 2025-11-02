'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatatanPerilakuPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman input
    router.push('/catatan-perilaku/input');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
