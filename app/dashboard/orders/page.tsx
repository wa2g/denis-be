'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  DocumentCheckIcon,
  PlusCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';
import { handleUnauthorizedResponse } from '@/app/utils';

interface OrderItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  companyName: string;
  farmName: string;
  region: string;
  items: OrderItem[];
  totalAmount: string;
  status: string;
  contactName: string;
  approvedBy?: string;
  approvedDate?: string;
  accountantApproved?: boolean;
  managerApproved?: boolean;
  invoices: { id: string }[];
  orderManagerId: string;
}

interface OrderDetails extends Order {
  farmNumber: string;
  villageName: string;
  pobox: string;
  phoneNumber: string;
  preparedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'PURCHASE' | 'SERVICE' | 'CONSULTING'>('PURCHASE');

  const getAuthToken = useCallback(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    return userCookie ? userCookie.split('=')[1] : null;
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get user data from localStorage
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      console.log('Current user:', user); // Debug log
      
      // Use the main orders endpoint for all users
      const url = `${process.env.BASE_URL}/orders/`;
      console.log('Fetching orders from:', url); // Debug log

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (handleUnauthorizedResponse(response)) return;
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData); // Debug log
        throw new Error(errorData?.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('Fetched orders:', data); // Debug log

      // If user is a customer, filter orders to show only their orders
      const filteredOrders = user?.role === 'CUSTOMER' 
        ? data.filter((order: Order) => order.orderManagerId === user.id)
        : data;

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
    // Get user role from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      console.log('Current user role:', user.role); // Debug log
      setUserRole(user.role);
    }
  }, [fetchOrders]);

  // Helper function to format date consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Generate unique key for items
  const generateItemKey = (item: OrderItem, index: number) => {
    const uniqueString = `${item.description}-${item.quantity}-${item.unitPrice}-${item.totalPrice}-${index}`;
    return Buffer.from(uniqueString).toString('base64');
  };

  const fetchOrderDetails = async (orderNumber: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/orders/${orderNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    outForDelivery: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    approved: orders.filter(o => o.status === 'APPROVED').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'COMPLETED':
  //       return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
  //     case 'IN_PROGRESS':
  //       return <ClockIcon className="w-8 h-8 text-blue-500" />;
  //     case 'OUT_FOR_DELIVERY':
  //       return <TruckIcon className="w-8 h-8 text-yellow-500" />;
  //     case 'PENDING':
  //       return <DocumentCheckIcon className="w-8 h-8 text-gray-500" />;
  //     default:
  //       return null;
  //   }
  // };

  const handleApproveOrder = async (orderId: string, orderNumber: string, currentStatus: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine next status
      let nextStatus = '';
      if (currentStatus === 'PENDING' && userRole === 'ACCOUNTANT') {
        nextStatus = 'IN_PROGRESS';
      } else if (currentStatus === 'IN_PROGRESS' && (userRole === 'MANAGER' || userRole === 'CEO')) {
        nextStatus = 'APPROVED';
      } else {
        alert('You are not authorized to approve this order at this stage.');
        return;
      }

      const response = await fetch(`${process.env.BASE_URL}/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          reason: `Approved by ${userRole}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response data:', errorData);
        throw new Error(errorData?.message || 'Failed to approve order');
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            const updatedOrder = { ...order };
            if (nextStatus === 'IN_PROGRESS') {
              updatedOrder.accountantApproved = true;
              updatedOrder.status = 'IN_PROGRESS';
            } else if (nextStatus === 'APPROVED') {
              updatedOrder.managerApproved = true;
              updatedOrder.status = 'APPROVED';
            }
            return updatedOrder;
          }
          return order;
        })
      );

      // Refresh orders after approval
      fetchOrders();
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
          reason: `Cancelled by ${userRole}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response data:', errorData);
        throw new Error(errorData?.message || 'Failed to cancel order');
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      );

      // Refresh orders after cancellation
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleGenerateInvoice = async (orderId: string, orderNumber: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/invoices/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId,
          orderNumber,
          type: invoiceType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate invoice' }));
        throw new Error(errorData.message || 'Failed to generate invoice');
      }

      const invoice = await response.json();
      console.log('Generated invoice:', invoice);
      
      // Show success message
      alert('Invoice generated successfully!');
      
      // Close the modal
      setShowInvoiceModal(false);
      setSelectedOrder(null);
      
      // Refresh orders to update the invoice status
      await fetchOrders();
      
      // Redirect to the invoices page after successful generation
      router.push('/dashboard/finance/invoices');
    } catch (error) {
      console.error('Error generating invoice:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to generate invoice. Please try again.');
      }
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    try {
      const token = getAuthToken();
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found');
      }
      
      const user = JSON.parse(userData);
      const allowedRoles = ['ADMIN', 'CEO', 'MANAGER'];
      
      if (!allowedRoles.includes(user.role)) {
        alert('You do not have permission to delete orders');
        return;
      }

      const confirmed = window.confirm(`Are you sure you want to delete order ${orderNumber}?`);
      if (!confirmed) return;

      const response = await fetch(`${process.env.BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      alert('Order deleted successfully');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  if (!mounted) {
    return null; // Return null on server-side to prevent hydration issues
  }

  return (
    <div>
      {/* Header with New Order Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">Orders Overview</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center px-4 py-2 bg-[#066b3a] hover:bg-[#055830] text-white rounded-md transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <DocumentCheckIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Out for Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{stats.outForDelivery}</p>
            </div>
            <TruckIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No orders found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Farm Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Region</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Items</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Total (TZS)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mounted ? formatDate(order.date) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.farmName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {order.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {parseFloat(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchOrderDetails(order.orderNumber)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                        
                        {/* Show approve/cancel buttons only for accountant and manager */}
                        {(
                          // Show to MANAGER or CEO if status is IN_PROGRESS
                          ((order.status === 'IN_PROGRESS') && (userRole === 'MANAGER' || userRole === 'CEO')) ||
                          // Show to ACCOUNTANT or MANAGER if status is PENDING
                          ((order.status === 'PENDING') && (userRole === 'ACCOUNTANT' || userRole === 'MANAGER'))
                        ) && (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order.id, order.orderNumber, order.status)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </>
                        )}

                        {/* Show Generate Invoice button for accountants when order is approved */}
                        {userRole === 'ACCOUNTANT' && 
                         order.status === 'APPROVED' && (
                          <>
                            {(order.invoices ?? []).length > 0 ? (
                              <button
                                onClick={() => router.push(`/dashboard/finance/invoices?id=${order.invoices?.[0]?.id}`)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View Invoice
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order as OrderDetails);
                                  setShowInvoiceModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                Generate Invoice
                              </button>
                            )}
                          </>
                        )}

                        {/* Show delete button for admin, CEO, and manager */}
                        {['ADMIN', 'CEO', 'MANAGER'].includes(userRole) && (
                          <button
                            onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && mounted && !showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Header Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
              <button
                onClick={() => window.print()}
                className="bg-[#8B0000] hover:bg-[#660000] text-white px-4 py-1 rounded-md text-sm flex items-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Printable content */}
            <div className="p-8 pt-16 print:p-4" id="printable-content">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <Image
                    src="/images/logos/logo-spade.png"
                    alt="Spade Logo"
                    width={64}
                    height={64}
                    className="mb-2"
                  />
                  <h1 className="text-xl font-bold text-gray-900 text-[#8B0000]">Spade Co. Ltd</h1>
                  <p className="text-sm text-gray-900">1B Tanganyika - Maichagange Street</p>
                  <p className="text-sm text-gray-900">+255 (0)653461126/+255(0)754574743</p>
                  <div className="text-sm">
                    <a href="mailto:info@spade.co.tz" className="text-gray-900 text-[#8B0000]">info@spade.co.tz</a>,{' '}
                    <a href="http://www.spade.co.tz" className="text-gray-900 text-[#8B0000]">www.spade.co.tz</a>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-[#8B0000] mb-2">REQUEST ORDER</h2>
                  <p className="text-sm text-gray-900">ORDER #: {selectedOrder.orderNumber}</p>
                  <p className="text-sm text-gray-900">Date: {formatDate(selectedOrder.date)}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-8">
                <div className="text-gray-900 mb-4">
                  <h3 className="text-gray-900 font-bold mb-2">To:</h3>
                  <p>{selectedOrder.companyName}</p>
                  <p>{selectedOrder.farmName}</p>
                  <p>Farm No. {selectedOrder.farmNumber}</p>
                  <p>{selectedOrder.villageName}</p>
                  <p>{selectedOrder.region}</p>
                  <p>Box {selectedOrder.pobox}</p>
                </div>

                <div className="text-gray-900 mb-4">
                  <h3 className="text-gray-900 font-bold mb-2">Contact Person:</h3>
                  <p>{selectedOrder.contactName}</p>
                  <p>{selectedOrder.phoneNumber}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead className="text-gray-900 bg-[#8B0000] text-white">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-gray-900 text-left">Qty</th>
                      <th className="border border-gray-300 px-4 py-2 text-gray-900 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-gray-900 text-right">Unit price (TZS)</th>
                      <th className="border border-gray-300 px-4 py-2 text-gray-900 text-right">Total (TZS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr 
                        key={generateItemKey(item, index)}
                        className="border-b"
                      >
                        <td className="border border-gray-300 text-gray-900 px-4 py-2">{item.quantity}</td>
                        <td className="border border-gray-300 text-gray-900 px-4 py-2">{item.description}</td>
                        <td className="border border-gray-300 text-gray-900 px-4 py-2 text-right">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 text-gray-900 px-4 py-2 text-right">
                          {item.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="border border-gray-300 px-4 py-2 text-gray-900 text-right">Total</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-900 text-right">
                        {parseFloat(selectedOrder.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="mt-8">
                <p className="text-gray-900 mb-4">Order prepared by: {selectedOrder.preparedBy}</p>
                <p className="text-gray-900 text-sm mb-4">
                  This order on named goods are subjected to your reaction immediately after receiving. All payment that will be made
                  regarding to this order should be reacted with receipt from your company.
                </p>
                <div className="mt-6">
                  <p className="text-gray-900 mb-2">To accept this order please return with Signature: _____________________________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {showInvoiceModal && selectedOrder && (
        <>
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Generate Invoice</h2>
              <div className="mb-6">
                <p className="text-gray-600 mb-4 text-gray-900">Are you sure you want to generate an invoice for order #{selectedOrder.orderNumber}?</p>
                <p className="text-gray-600 mb-4 text-gray-900">Total Amount: {selectedOrder.totalAmount} TZS</p>
                
                {/* Invoice Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Select Invoice Type
                  </label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value as 'PURCHASE' | 'SERVICE' | 'CONSULTING')}
                    className="w-full border border-gray-300 text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#066b3a] focus:border-[#066b3a]"
                  >
                    <option value="PURCHASE">Purchase</option>
                    <option value="SERVICE">Service</option>
                    <option value="CONSULTING">Consulting</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerateInvoice(selectedOrder.id, selectedOrder.orderNumber)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export type { Order };
export const getAuthToken = () => {
  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  return userCookie ? userCookie.split('=')[1] : null;
}; 