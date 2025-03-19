'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sale } from '@/app/types/sales';
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface SaleDetailsClientProps {
  id: string;
}

export default function SaleDetailsClient({ id }: SaleDetailsClientProps) {
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchSaleDetails = useCallback(async () => {
    try {
      console.log('Fetching sale details...');
      const response = await fetch(`${process.env.BASE_URL}/sales/${id}`, {
        headers: getAuthHeaders(),
      });

      console.log('Sale details response status:', response.status);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sale details error response:', errorText);
        throw new Error(`Failed to fetch sale details: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setSale(data);
    } catch (error) {
      console.error('Sale details error:', error);
      setError('Unable to load sale details');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Sale not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-sm text-red-600 hover:text-red-500"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">Sale Details</h1>
          <p className="text-gray-600">Sale ID: {sale.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sale Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-gray-900 mb-2">{sale.customer.name}</p>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sale Information</h2>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-gray-900 mb-2">{new Date(sale.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="text-gray-900 mb-2">{sale.paymentType}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Items</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {Number(item.unitPrice).toLocaleString()} TZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {Number(item.totalPrice).toLocaleString()} TZS
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="font-bold">
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-900 text-right">
                    Total Amount
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {Number(sale.totalAmount).toLocaleString()} TZS
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="text-gray-900">{sale.createdBy.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-gray-900">{new Date(sale.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-gray-900">{new Date(sale.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 