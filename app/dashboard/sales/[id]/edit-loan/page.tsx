'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sale } from '@/app/types/sales';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

export default function EditLoanSale() {
  const router = useRouter();
  const params = useParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [amountPaid, setAmountPaid] = useState('0');
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchSale = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/sales/${id}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch sale');
      }

      const data = await response.json();
      setSale(data);
      setAmountPaid(data.amountPaid || '0');
      setLoading(false);
    } catch (_error) {
      console.error('Error fetching sale:', _error);
      alert('Error loading sale details. Please try again.');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    fetchSale(id);
  }, [params?.id, fetchSale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = params?.id as string;
    if (!id) return;

    try {
      const response = await fetch(`${process.env.BASE_URL}/sales/${id}/loan-payment`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amountPaid: Number(amountPaid)
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      router.push(`/dashboard/sales/${id}`);
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Error updating payment. Please try again.');
    }
  };

  if (loading || !sale) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  const totalAmount = Number(sale.totalAmount);
  const currentAmountPaid = Number(sale.amountPaid);
  const remainingAmount = totalAmount - currentAmountPaid;

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
          <h1 className="text-2xl font-bold text-[#066b3a]">Edit Loan Payment</h1>
          <p className="text-gray-600">Update payment for loan sale</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900">Customer</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{sale.customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Total Amount</label>
                <p className="mt-1 text-lg font-medium text-gray-900">{totalAmount.toLocaleString()} TZS</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Amount Paid</label>
                <p className="mt-1 text-lg font-medium text-green-900">{currentAmountPaid.toLocaleString()} TZS</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Remaining Amount</label>
                <p className="mt-1 text-lg font-medium text-red-900">{remainingAmount.toLocaleString()} TZS</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Add Payment Amount
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-gray-900"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  min="0"
                  max={remainingAmount}
                  step="0.01"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                  disabled={Number(amountPaid) <= 0 || Number(amountPaid) > remainingAmount}
                >
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 