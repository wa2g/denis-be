'use client';
import { useState, useEffect, useCallback } from 'react';
import RequestForm from '@/app/components/modal/RequestForm';
import { 
  DocumentCheckIcon,
  ClockIcon,
  DocumentIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface RequestItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface RequestFormData {
  taskType: string;
  employeeName: string;
  employeeTitle: string;
  employeeAddress: string;
  employeePhone: string;
  items: RequestItem[];
  spadeEmployee: string;
}

interface Request {
  id: string;
  requestNumber: string;
  requestDate: string;
  taskType: string;
  employeeName: string;
  employeeTitle: string;
  total: string;
  status: string;
  items: RequestItem[];
  invoiceSubtotal: string;
  transactionCharges: string;
}

export default function RequestFormPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/requests`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      console.log('Fetched requests:', data); // Debug log
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Error loading requests. Please try again.');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRequests();
    // Get user data from cookie
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [fetchRequests]);

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleSubmit = async (formData: RequestFormData) => {
    try {
      // Calculate total from items
      const total = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Add request number and date
      const requestData = {
        ...formData,
        requestNumber: `REQ-${Date.now()}`,
        requestDate: new Date().toISOString(),
        total,
        status: 'Pending' as const
      };

      const response = await fetch(`${process.env.BASE_URL}/requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      // Refresh requests after successful submission
      fetchRequests();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error creating request. Please try again.');
    }
  };

  useEffect(() => {
    const currentStats = {
      total: requests.length,
      approved: requests.filter(r => r.status.toLowerCase() === 'approved').length,
      pending: requests.filter(r => r.status.toLowerCase() === 'pending').length,
      rejected: requests.filter(r => r.status.toLowerCase() === 'rejected').length,
      markedForInvoice: requests.filter(r => r.status.toLowerCase() === 'marked_for_invoice').length
    };
    console.log('Current requests:', requests); // Debug log
    console.log('Current stats:', currentStats); // Debug log
  }, [requests]);

  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status.toLowerCase() === 'approved').length,
    pending: requests.filter(r => r.status.toLowerCase() === 'pending').length,
    rejected: requests.filter(r => r.status.toLowerCase() === 'rejected').length,
    markedForInvoice: requests.filter(r => r.status.toLowerCase() === 'marked_for_invoice').length
  };

  const updateRequestStatus = async (requestId: string, status: 'APPROVED' | 'REJECTED' | 'MARKED_FOR_INVOICE', comments: string) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status,
          comments
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Refresh requests after successful update
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Error updating request status. Please try again.');
    }
  };

  const generateInvoice = async (requestId: string) => {
    try {
      // Find the request to get its details
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      const invoiceData = {
        requestId: requestId,
        notes: "Payment due within 30 days"
      };

      console.log('Generating invoice with data:', invoiceData); // Debug log

      const response = await fetch(`${process.env.BASE_URL}/invoices/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invoiceData),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Invoice generation error:', errorData); // Debug log
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Failed to generate invoice');
      }

      // Refresh requests after successful invoice generation
      fetchRequests();
      alert('Invoice generated successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert(error instanceof Error ? error.message : 'Error generating invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">Request Forms</h1>
          <p className="text-gray-600 mt-2">Manage and track your requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#066b3a] text-white px-4 py-2 rounded-lg hover:bg-[#055830] flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <DocumentIcon className="w-8 h-8 text-[#066b3a]" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <DocumentCheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (TZS)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {request.requestNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.taskType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {request.employeeTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {request.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status.toLowerCase() === 'marked_for_invoice'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'MARKED_FOR_INVOICE' ? 'Ready for Invoice' : request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.status.toLowerCase() === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateRequestStatus(request.id, 'APPROVED', 'Request approved for processing')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'REJECTED', 'Request rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {request.status.toLowerCase() === 'approved' && user?.role === 'ACCOUNTANT' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateInvoice(request.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Generate Invoice"
                        >
                          <CurrencyDollarIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto">
            <RequestForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 