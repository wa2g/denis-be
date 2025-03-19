'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  center: string;
  centers: string[];
}

export default function CustomersLanding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    console.log('User string from localStorage:', userStr);
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('Parsed user data:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const centers = [
    {
      name: 'KAHAMA',
      description: 'View and manage customers in Kahama center',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      stats: {
        title: 'Kahama Center',
        subtitle: 'Customer Management'
      }
    },
    {
      name: 'SHINYANGA',
      description: 'View and manage customers in Shinyanga center',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      stats: {
        title: 'Shinyanga Center',
        subtitle: 'Customer Management'
      }
    },
    {
      name: 'MAGANZO',
      description: 'View and manage customers in Maganzo center',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      stats: {
        title: 'Maganzo Center',
        subtitle: 'Customer Management'
      }
    }
  ];

  const hasFullAccess = ['ADMIN', 'CEO', 'MANAGER', 'ACCOUNTANT'].includes(user?.role || '');
  console.log('Has full access:', hasFullAccess);
  console.log('User role:', user?.role);
  console.log('User centers:', user?.centers);
  
  const filteredCenters = hasFullAccess 
    ? [...centers, {
        name: 'ALL',
        description: 'View and manage all customers across centers',
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        stats: {
          title: 'All Centers',
          subtitle: 'Combined Customer Management'
        }
      }]
    : centers.filter(center => user?.centers?.includes(center.name));
  
  console.log('Filtered centers:', filteredCenters);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#066b3a]">Customer Centers</h1>
        {/* <p className="text-gray-600">Select a center to view and manage its customers</p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCenters.map((center) => (
          <div
            key={center.name}
            onClick={() => router.push(`/dashboard/customers/list?center=${center.name}`)}
            className={`${center.color} rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 ${center.hoverColor}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <UserGroupIcon className="h-10 w-10 text-white opacity-90" />
                <span className="text-xl font-bold text-white">{center.name}</span>
              </div>
              <p className="text-white text-sm opacity-90 mb-4">{center.description}</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <h3 className="text-white font-semibold">{center.stats.title}</h3>
                <p className="text-white/80 text-sm">{center.stats.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 