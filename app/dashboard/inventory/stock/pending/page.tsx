'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  ClockIcon,
  TruckIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import { getAuthToken, getUserRole } from '../../../../utils';

interface PendingStock {
  id: string;
  type: string;
  status: string;
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
  receivedBy?: {
    id: string;
    email: string;
    role: string;
  };
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

interface ReceiveStockModalProps {
  stock: PendingStock;
  onClose: () => void;
  onReceive: (stockId: string, quantity: number, notes: string) => Promise<void>;
}

function ReceiveStockModal({ stock, onClose, onReceive }: ReceiveStockModalProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (quantity > parseFloat(stock.expectedQuantity)) {
      setError("Quantity cannot exceed expected quantity");
      return;
    }
    await onReceive(stock.id, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Receive Stock</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Quantity: {parseFloat(stock.expectedQuantity).toLocaleString()}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Already Received: {parseFloat(stock.receivedQuantity).toLocaleString()}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remaining: {(parseFloat(stock.expectedQuantity) - parseFloat(stock.receivedQuantity)).toLocaleString()}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter quantity to receive"
                min="0"
                max={parseFloat(stock.expectedQuantity)}
                step="1"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                rows={3}
                placeholder="Add any notes about the stock reception"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              Receive Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PendingStockPage() {
  const router = useRouter();
  const [allStock, setAllStock] = useState<PendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStock, setSelectedStock] = useState<PendingStock | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  const fetchAllStock = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/stock`, {
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
        throw new Error('Failed to fetch stock data');
      }

      const data = await response.json();
      setAllStock(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchUserRole = useCallback(() => {
    const role = getUserRole();
    console.log('User Role from cookie:', role); // Debug log
    if (role) {
      setUserRole(role);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchAllStock();
    fetchUserRole();
  }, [fetchAllStock, fetchUserRole]);

  const handleReceiveStock = async (stockId: string, quantity: number, notes: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/stock/${stockId}/receive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receivedQuantity: quantity,
          notes: notes || undefined // Only include notes if it's not empty
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to receive stock');
      }

      // Refresh stock data
      fetchAllStock();
    } catch (error) {
      console.error('Error receiving stock:', error);
    }
  };

  const handleApproveStock = async (stockId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/stock/${stockId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve stock');
      }

      // Refresh stock data
      fetchAllStock();
    } catch (error) {
      console.error('Error approving stock:', error);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => ({
    total: allStock.length,
    pending: allStock.filter(s => s.status === 'PENDING').length,
    partiallyReceived: allStock.filter(s => s.status === 'PARTIALLY_RECEIVED').length,
    received: allStock.filter(s => s.status === 'FULLY_RECEIVED').length,
    totalValue: allStock.reduce((sum, stock) => 
      sum + (parseFloat(stock.unitPrice) * parseFloat(stock.expectedQuantity)), 0
    ),
  }), [allStock]);

  // Filter stock based on selected status
  const filteredStock = useMemo(() => {
    if (statusFilter === 'all') return allStock;
    return allStock.filter(stock => stock.status === statusFilter);
  }, [allStock, statusFilter]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'FULLY_RECEIVED':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_RECEIVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Stock Management</h1>
        <p className="text-black mt-2">Manage and track all stock deliveries</p>
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
              <p className="text-2xl font-bold text-black">{stats.received}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-green-500" />
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
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="FULLY_RECEIVED">Fully Received</option>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved By
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
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stock.status)}`}>
                        {typeof stock.status === 'string' ? stock.status.replace(/_/g, ' ') : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {stock.receivedBy?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {stock.accountantApprovedById ? 'Approved' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Debug info */}
                        {/* {console.log('Current stock:', stock.id, 'Status:', stock.status, 'User Role:', userRole, 'Approved:', stock.accountantApprovedById)} */}
                        
                        {userRole !== 'ACCOUNTANT' && (stock.status === 'PENDING' || stock.status === 'PARTIALLY_RECEIVED') && (
                          <button
                            onClick={() => setSelectedStock(stock)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <TruckIcon className="w-4 h-4 mr-1" />
                            Receive Stock
                          </button>
                        )}
                        {userRole === 'ACCOUNTANT' && 
                         (stock.status === 'FULLY_RECEIVED' || stock.status === 'PARTIALLY_RECEIVED') && 
                         !stock.accountantApprovedById && (
                          <button
                            onClick={() => handleApproveStock(stock.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <CheckBadgeIcon className="w-4 h-4 mr-1" />
                            Approve Stock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                      No stock found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Receive Stock Modal */}
      {selectedStock && (
        <ReceiveStockModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onReceive={handleReceiveStock}
        />
      )}
    </div>
  );
} 