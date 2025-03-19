'use client';
// import { useState } from 'react';

export default function OrderStats() {
  const stats = [
    { label: 'Total Orders', value: '156', change: '+12%' },
    { label: 'Pending Approvals', value: '8', change: '-2%' },
    { label: 'Low Stock Items', value: '12', change: '+3' },
    { label: 'Pending Expenses', value: '5', change: '+2' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-500">{stat.label}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </div>
            <div className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 