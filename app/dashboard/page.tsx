'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Wrap in setTimeout to avoid immediate redirect
    setTimeout(() => {
      router.push('/dashboard/orders');
    }, 0);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0175bb]"></div>
    </div>
  );
}

// Make sure to use a default export
export default DashboardPage; 