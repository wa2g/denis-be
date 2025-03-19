'use client';

import { useState, useEffect, useCallback } from 'react';
import { SalesSummary } from '@/app/types/sales';
import {
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  // ArrowTrendingUpIcon,
  // ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface SalesReport {
  summary: SalesSummary;
  dailySales: {
    date: string;
    total: string;
    count: number;
  }[];
  topCustomers: {
    customerId: number;
    customerName: string;
    totalPurchases: string;
    salesCount: number;
  }[];
  paymentMethods: {
    method: string;
    total: string;
    count: number;
  }[];
}

export default function Reports() {
  const router = useRouter();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/reports/sales?range=${dateRange}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">Sales Reports</h1>
          <p className="text-gray-600">Analytics and performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(['WEEK', 'MONTH', 'YEAR'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded ${
                dateRange === range
                  ? 'bg-[#066b3a] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-xl font-bold">
                {Number(report.summary.totalSales).toLocaleString()} TZS
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-xl font-bold">{report.summary.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Loan Sales</p>
              <p className="text-xl font-bold">
                {Number(report.summary.loanSales).toLocaleString()} TZS
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <BanknotesIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-xl font-bold">
                {Number(report.summary.pendingPayments).toLocaleString()} TZS
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Sales</h2>
          <div className="space-y-4">
            {report.dailySales.map((day) => (
              <div key={day.date} className="flex items-center">
                <div className="w-24 text-sm text-gray-500">
                  {new Date(day.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#066b3a]"
                      style={{
                        width: `${(Number(day.total) / Number(report.summary.totalSales)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Number(day.total).toLocaleString()} TZS
                  </div>
                  <div className="text-xs text-gray-500">{day.count} sales</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
          <div className="space-y-4">
            {report.paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center">
                <div className="w-32 text-sm text-gray-500">{method.method}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#066b3a]"
                      style={{
                        width: `${(Number(method.total) / Number(report.summary.totalSales)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Number(method.total).toLocaleString()} TZS
                  </div>
                  <div className="text-xs text-gray-500">{method.count} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Top Customers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Purchases
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Number of Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Average Purchase
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.topCustomers.map((customer) => (
                    <tr
                      key={customer.customerId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/customers/${customer.customerId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {Number(customer.totalPurchases).toLocaleString()} TZS
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">{customer.salesCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-gray-900">
                          {(
                            Number(customer.totalPurchases) / customer.salesCount
                          ).toLocaleString()}{' '}
                          TZS
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 