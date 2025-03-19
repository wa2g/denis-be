'use client';
import { useEffect, useState } from 'react';
import {usePathname } from 'next/navigation';
import Image from 'next/image';
import { DashboardNav } from '../components/DashboardNav';
import { ProfileMenu } from '../components/ProfileMenu';
import { useTokenValidation } from '../hooks/useTokenValidation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useTokenValidation();
  const pathname = usePathname();
  // const router = useRouter();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    // Update page title based on current path
    const path = pathname.split('/').pop();
    if (path) {
      setPageTitle(path.charAt(0).toUpperCase() + path.slice(1));
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0175bb] overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <Image
            src="/images/logos/logo-spade-white.png"
            alt="SpaDe Logo"
            width={150}
            height={50}
            className="mx-auto"
          />
        </div>
        <DashboardNav />
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 bg-white shadow-sm z-10">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{pageTitle}</h1>
              <nav className="flex mt-1" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 text-sm text-gray-500">
                  <li>
                    <a href="/dashboard" className="hover:text-gray-900">Dashboard</a>
                  </li>
                  {pathname !== '/dashboard' && (
                    <>
                      <li>/</li>
                      <li className="text-gray-900">{pageTitle}</li>
                    </>
                  )}
                </ol>
              </nav>
            </div>
            <ProfileMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="pt-24 px-8 pb-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}