'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  // TruckIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    location: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  total: number;
  status: 'Pending' | 'In Progress' | 'Out for Delivery' | 'Completed';
  accountantStatus: 'Pending Receipt' | 'Received' | 'Rejected';
}

export default function AccountantOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-001',
      date: '2024-03-15',
      customer: {
        name: 'Farm One',
        location: 'Dar es Salaam',
      },
      items: [
        { name: 'Item 1', quantity: 2, unitPrice: 50000 },
        { name: 'Item 2', quantity: 1, unitPrice: 350000 },
      ],
      total: 450000,
      status: 'Pending',
      accountantStatus: 'Pending Receipt',
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      date: '2024-03-16',
      customer: {
        name: 'Farm Two',
        location: 'Arusha',
      },
      items: [
        { name: 'Item 1', quantity: 3, unitPrice: 75000 },
      ],
      total: 225000,
      status: 'In Progress',
      accountantStatus: 'Received',
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      date: '2024-03-17',
      customer: {
        name: 'Farm Three',
        location: 'Mwanza',
      },
      items: [
        { name: 'Item 1', quantity: 1, unitPrice: 150000 },
      ],
      total: 150000,
      status: 'Completed',
      accountantStatus: 'Received',
    },
  ]);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.accountantStatus === 'Pending Receipt').length,
    received: orders.filter(o => o.accountantStatus === 'Received').length,
    rejected: orders.filter(o => o.accountantStatus === 'Rejected').length,
    totalValue: orders.reduce((sum, order) => sum + order.total, 0),
  }), [orders]);

  // Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(order => order.accountantStatus === statusFilter);
  }, [orders, statusFilter]);

  const handleAccountantAction = (orderId: string, action: 'Received' | 'Rejected') => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            accountantStatus: action,
            status: action === 'Received' ? 'In Progress' : 'Pending'
          };
        }
        return order;
      })
    );
  };

  const handleCreateInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoice = async () => {
    try {
      // Here you would typically make an API call to generate the invoice
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success notification
      toast.success('Invoice generated successfully!');
      
      // Close the modal
      setShowInvoiceModal(false);
      setSelectedOrder(null);
      
      // Redirect to invoices page
      router.push('/dashboard/finance/invoices');
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Orders for Review</h1>
        <p className="text-black mt-2">Review and process incoming orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-[#066b3a]" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Pending Receipt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Received</p>
              <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalValue.toLocaleString()} TZS</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
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
            <option value="all">All Orders</option>
            <option value="Pending Receipt">Pending Receipt</option>
            <option value="Received">Received</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-black">Orders List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase">Total (TZS)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {order.customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {order.customer.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-right">
                    {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.accountantStatus === 'Received' 
                        ? 'bg-green-100 text-green-800'
                        : order.accountantStatus === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.accountantStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon className="w-5 h-5" />
                        View
                      </button>
                      
                      {order.accountantStatus === 'Pending Receipt' && (
                        <>
                          <button
                            onClick={() => handleAccountantAction(order.id, 'Received')}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                            Receive
                          </button>
                          <button
                            onClick={() => handleAccountantAction(order.id, 'Rejected')}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800"
                          >
                            <XCircleIcon className="w-5 h-5" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {order.accountantStatus === 'Received' && (
                        <button
                          onClick={() => handleCreateInvoice(order)}
                          className="flex items-center gap-1 text-[#066b3a] hover:text-[#055830]"
                        >
                          <DocumentTextIcon className="w-5 h-5" />
                          Create Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showInvoiceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-black">Order Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-black">Order Number</p>
                  <p className="font-medium text-black">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Date</p>
                  <p className="font-medium text-black">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Customer</p>
                  <p className="font-medium text-black">{selectedOrder.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Location</p>
                  <p className="font-medium text-black">{selectedOrder.customer.location}</p>
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200 mt-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-black">Item</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-black">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-black">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-black">{item.name}</td>
                      <td className="px-4 py-2 text-center text-black">{item.quantity}</td>
                      <td className="px-4 py-2 text-right text-black">{item.unitPrice.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-black">
                        {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-bold text-black">Total:</td>
                    <td className="px-4 py-2 text-right font-bold text-black">
                      {selectedOrder.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-black">Create Invoice</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-black">Order Number</p>
                  <p className="font-medium text-black">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Customer</p>
                  <p className="font-medium text-black">{selectedOrder.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-black">Total Amount</p>
                  <p className="font-medium text-black">{selectedOrder.total.toLocaleString()} TZS</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 