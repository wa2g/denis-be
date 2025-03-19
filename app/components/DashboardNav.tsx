'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ClipboardDocumentListIcon,
  CubeIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactElement;
  roles: string[];
};

const navItems: NavItem[] = [
  { 
    path: '/dashboard/orders', 
    label: 'Orders',
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/inventory', 
    label: 'Inventory',
    icon: <CubeIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/inventory/stock/pending', 
    label: 'Stock Pending',
    icon: <CubeIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/chicken-stock', 
    label: 'Chicken Stock',
    icon: <CubeIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/finance/invoices', 
    label: 'Invoices',
    icon: <CubeIcon className="w-5 h-5" />,
    roles: ['ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/finance', 
    label: 'Finance',
    icon: <BanknotesIcon className="w-5 h-5" />,
    roles: ['ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/request-form', 
    label: 'Requests',
    icon: <DocumentTextIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/management', 
    label: 'Management',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['ADMIN']
  },
  { 
    path: '/dashboard/users', 
    label: 'Users',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/customers', 
    label: 'customers',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/customers/weekly-orders', 
    label: 'Weekly Orders',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/sales', 
    label: 'sales',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/loans', 
    label: 'Loans',
    icon: <UserGroupIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/reports', 
    label: 'Reports',
    icon: <ChartBarIcon className="w-5 h-5" />,
    roles: ['ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  },
  { 
    path: '/dashboard/settings', 
    label: 'Settings',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    roles: ['ORDER_MANAGER', 'ACCOUNTANT', 'MANAGER', 'CEO', 'ADMIN']
  }
];

export function DashboardNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserRole(user.role);
    }
  }, []);

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="mt-6 px-3">
      {filteredNavItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors
            ${pathname === item.path 
              ? 'bg-white text-[#0175bb]' 
              : 'text-white hover:bg-white/10'}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
} 