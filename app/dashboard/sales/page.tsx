'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sale } from '@/app/types/sales';
import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SalesDashboard() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchSales = useCallback(async () => {
    try {
      console.log('Fetching sales...');
      const response = await fetch(`${process.env.BASE_URL}/sales`, {
        headers: getAuthHeaders(),
      });

      console.log('Sales response status:', response.status);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sales error response:', errorText);
        throw new Error(`Failed to fetch sales: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Sales error details:', error);
      setError('Unable to load sales');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Calculate summary statistics from sales data
  const calculateSummary = () => {
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const cashSales = sales
      .filter(sale => sale.paymentType === 'CASH')
      .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    const loanSales = sales
      .filter(sale => sale.paymentType === 'LOAN')
      .reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    
    return {
      totalSales,
      cashSales,
      loanSales,
      totalTransactions: sales.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchSales();
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your sales performance</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/dashboard/sales/new')}
            className="flex items-center gap-2 px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
          >
            <PlusIcon className="w-5 h-5" />
            New Sale
          </button>
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
              <p className="text-xl font-bold text-gray-900">{summary.totalSales.toLocaleString()} TZS</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cash Sales</p>
              <p className="text-xl font-bold text-gray-900">{summary.cashSales.toLocaleString()} TZS</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Loan Sales</p>
              <p className="text-xl font-bold text-gray-900">{summary.loanSales.toLocaleString()} TZS</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900">{summary.totalTransactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#066b3a]">
                    {sale.customer.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {Number(sale.totalAmount).toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sale.paymentType === 'CASH'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sale.paymentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {sale.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => router.push(`/dashboard/sales/${sale.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-1 border border-[#066b3a] text-sm leading-5 font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white focus:outline-none focus:shadow-outline-green active:bg-[#055830] transition ease-in-out duration-150"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => router.push(`/dashboard/sales/${sale.id}/edit-loan`)}
                      className="inline-flex items-center gap-2 px-3 py-1 border border-[#066b3a] text-sm leading-5 font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white focus:outline-none focus:shadow-outline-green active:bg-[#055830] transition ease-in-out duration-150"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 