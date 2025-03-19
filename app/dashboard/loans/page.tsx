'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BanknotesIcon,
  CalendarIcon,
  // ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface LoanSale {
  id: string;
  paymentType: string;
  items: {
    quantity: number;
    productId: number;
    unitPrice: string;
    totalPrice: number;
    productName: string;
  }[];
  totalAmount: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  customer: {
    id: string;
    name: string;
    village: string;
    chickenType: string;
    orderedChicken: number;
    farmerStatus: boolean;
  };
  status?: 'ACTIVE' | 'PENDING' | 'COMPLETED';
}

export default function LoanManagement() {
  const router = useRouter();
  const [loans, setLoans] = useState<LoanSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchLoans = useCallback(async () => {
    try {
      console.log('Fetching loans...');
      const response = await fetch(`${process.env.BASE_URL}/sales/loans/all`, {
        headers: getAuthHeaders(),
      });

      console.log('Loans response status:', response.status);

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loans error response:', errorText);
        throw new Error(`Failed to fetch loans: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      // Temporarily assign random statuses for demonstration
      const loansWithStatus = data.map((loan: LoanSale) => ({
        ...loan,
        status: ['ACTIVE', 'PENDING', 'COMPLETED'][Math.floor(Math.random() * 3)] as 'ACTIVE' | 'PENDING' | 'COMPLETED'
      }));
      setLoans(loansWithStatus);
    } catch (error) {
      console.error('Loans error details:', error);
      alert('Unable to load loans. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  const totalLoanAmount = loans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0);
  const filteredLoans = filter === 'ALL' ? loans : loans.filter(loan => loan.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Loan Management</h1>
        <p className="text-gray-600">Track and manage customer loans</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <BanknotesIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Loans</p>
              <p className="text-xl font-bold text-gray-900">{loans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Loan Amount</p>
              <p className="text-xl font-bold text-gray-900">{totalLoanAmount.toLocaleString()} TZS</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BanknotesIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Loan Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {loans.length > 0
                  ? (totalLoanAmount / loans.length).toLocaleString()
                  : 0}{' '}
                TZS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2">
        {(['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status
                ? 'bg-[#066b3a] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            } border border-gray-200`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                loan.items.map((item, itemIndex) => (
                  <tr 
                    key={`${loan.id}-${itemIndex}`}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/sales/${loan.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(loan.totalAmount).toLocaleString()} TZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.createdBy.name}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
          {filteredLoans.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No loans found matching the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 