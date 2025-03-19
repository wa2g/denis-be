'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sale } from '@/app/types/sales';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

export default function SaleDetails() {
  const router = useRouter();
  const params = useParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditLoanModal, setShowEditLoanModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState('0');

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
    } catch (error) {
      console.error('Error fetching sale:', error);
      alert('Error loading sale details. Please try again.');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    fetchSale(id);
  }, [params?.id, fetchSale]);

  const handleLoanPayment = async (e: React.FormEvent) => {
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

      // Refresh sale data after successful payment
      await fetchSale(id);
      setShowEditLoanModal(false);
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
          <h1 className="text-2xl font-bold text-[#066b3a]">Sale Details</h1>
          <p className="text-gray-600">View and manage sale information</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900">Customer</label>
                <p className="mt-1 text-lg font-medium">{sale.customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Payment Type</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  sale.paymentType === 'CASH'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {sale.paymentType}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Total Amount</label>
                <p className="mt-1 text-lg font-medium">{totalAmount.toLocaleString()} TZS</p>
              </div>
              {sale.paymentType === 'LOAN' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Amount Paid</label>
                    <p className="mt-1 text-lg font-medium text-green-600">{currentAmountPaid.toLocaleString()} TZS</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Remaining Amount</label>
                    <p className="mt-1 text-lg font-medium text-red-600">{remainingAmount.toLocaleString()} TZS</p>
                  </div>
                  <div>
                    <button
                      onClick={() => setShowEditLoanModal(true)}
                      className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                      disabled={remainingAmount <= 0}
                    >
                      Add Payment
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
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
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Loan Payment Modal */}
      {showEditLoanModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-32 mx-auto p-6 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add Loan Payment</h3>
              <button
                onClick={() => setShowEditLoanModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleLoanPayment}>
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-900">New Payment Amount</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    min="0"
                    max={remainingAmount}
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditLoanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                  disabled={Number(amountPaid) <= 0 || Number(amountPaid) > remainingAmount}
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 