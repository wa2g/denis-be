'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/solid';
import { getAuthToken } from '../../utils';

interface PendingStock {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  date: string;
  companyName: string;
  farmName: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: string;
  status: string;
  deliveryStatus?: string; // Make deliveryStatus optional
  type: string;
  expectedQuantity: string;
  receivedQuantity: string;
  description: string;
  unitPrice: string;
  orderId: string;
  receivedById: string | null;
  receivedDate: string | null;
  accountantApprovedById: string | null;
  accountantApprovedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    companyName: string;
    farmName: string;
    farmNumber: string;
    villageName: string;
    contactName: string;
    phoneNumber: string;
    items: {
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      description: string;
    }[];
    totalAmount: string;
    status: string;
    orderNumber: string;
    date: string;
    region: string;
    pobox: string;
  };
}

export default function PendingStockPage() {
  const router = useRouter();
  const [pendingStock, setPendingStock] = useState<PendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPendingStock = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/stock/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch pending stock');
      }

      const data = await response.json();
      setPendingStock(data);
    } catch (error) {
      console.error('Error fetching pending stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStock();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: pendingStock.length,
    pending: pendingStock.filter(s => s.status === 'PENDING').length,
    partiallyReceived: pendingStock.filter(s => s.status === 'PARTIALLY_RECEIVED').length,
    fullyReceived: pendingStock.filter(s => s.status === 'FULLY_RECEIVED').length,
    totalValue: pendingStock.reduce((sum, stock) => 
      sum + (parseFloat(stock.unitPrice) * parseFloat(stock.expectedQuantity)), 0
    ),
  }), [pendingStock]);

  // Filter stock based on selected status
  const filteredStock = useMemo(() => {
    if (statusFilter === 'all') return pendingStock;
    return pendingStock.filter(stock => stock.deliveryStatus === statusFilter);
  }, [pendingStock, statusFilter]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleUpdateDeliveryStatus = async (stockId: string, status: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/stock/${stockId}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update delivery status');
      }

      // Refresh stock data
      fetchPendingStock();
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Stock Management</h1>
        <p className="text-black mt-2">View and track your stock deliveries</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Stock</p>
              <p className="text-2xl font-bold text-black">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-[#066b3a]" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Pending</p>
              <p className="text-2xl font-bold text-black">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Partially Received</p>
              <p className="text-2xl font-bold text-black">{stats.partiallyReceived}</p>
            </div>
            <TruckIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Fully Received</p>
              <p className="text-2xl font-bold text-black">{stats.fullyReceived}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-black">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm text-black"
          >
            <option value="all">All Stock</option>
            <option value="PENDING">Pending Delivery</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStock.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {stock.order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {stock.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {stock.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {parseFloat(stock.expectedQuantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {parseFloat(stock.receivedQuantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-right">
                      {parseFloat(stock.unitPrice).toLocaleString()} TZS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stock.deliveryStatus)}`}>
                        {(stock.deliveryStatus || 'PENDING').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {(!stock.deliveryStatus || stock.deliveryStatus === 'PENDING') && (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(stock.id, 'IN_PROGRESS')}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <TruckIcon className="w-4 h-4 mr-1" />
                            Start Delivery
                          </button>
                        )}
                        {stock.deliveryStatus === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(stock.id, 'DELIVERED')}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No pending stock found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 