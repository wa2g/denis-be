'use client';
import { useState } from 'react';

export default function ExecutiveDashboard() {
  const [metrics] = useState({
    revenue: 1250000,
    growth: 15.8,
    customers: 1280,
    satisfaction: 94.2,
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Executive Overview</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-bold">${(metrics.revenue / 1000000).toFixed(2)}M</div>
          <div className="text-sm text-green-600">↑ 12.5% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Growth Rate</div>
          <div className="text-2xl font-bold">{metrics.growth}%</div>
          <div className="text-sm text-green-600">↑ 2.3% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold">{metrics.customers}</div>
          <div className="text-sm text-green-600">↑ 48 new this month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Customer Satisfaction</div>
          <div className="text-2xl font-bold">{metrics.satisfaction}%</div>
          <div className="text-sm text-green-600">↑ 1.2% from last month</div>
        </div>
      </div>

      {/* Charts and Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
} 