'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface WeeklyOrder {
  weekStartDate: string;
  weekEndDate: string;
  consolidatedOrder: {
    orderDate: string;
    companyOrders: {
      silverland: {
        companyName: string;
        orders: {
          chickens: {
            type: string;
            quantity: number;
          };
          feeds: Array<{
            type: string;
            quantity: number;
          }>;
        };
      };
      ivrine: {
        companyName: string;
        orders: {
          chickens: {
            type: string;
            quantity: number;
          };
          feeds: Array<{
            type: string;
            quantity: number;
          }>;
        };
      };
    };
    customerDetails: Array<{
      name: string;
      phone: string;
      chickenOrder: {
        type: string;
        quantity: number;
      };
      feedOrders: Array<{
        type: string;
        quantity: number;
      }>;
    }>;
    weeklyBreakdown: Array<{
      weekStart: string;
      weekEnd: string;
      status: string;
      orders: Array<{
        date: string;
        orders: Array<{
          customerName: string;
          chickenType: string;
          quantity: number;
          feeds: Array<{
            type: string;
            quantity: number;
          }>;
        }>;
      }>;
    }>;
  };
}

export default function WeeklyOrders() {
  const [orders, setOrders] = useState<WeeklyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<{
    customer: WeeklyOrder['consolidatedOrder']['customerDetails'][0];
    orderNumber: string;
    date: string;
  } | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Add expanded state for weekly sections
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({0: true}); // First week expanded by default

  // Add state for company orders section
  const [isCompanyOrdersExpanded, setIsCompanyOrdersExpanded] = useState(true);

  const toggleWeekExpansion = (weekIndex: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekIndex]: !prev[weekIndex]
    }));
  };

  const fetchWeeklyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/customers/orders/weekly`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch weekly orders');
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching weekly orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyOrders();
  }, []);

  const handleSubmitWeeklyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the weekly orders data
      const orderData = {
        weekStartDate: orders?.weekStartDate,
        weekEndDate: orders?.weekEndDate,
        consolidatedOrder: orders?.consolidatedOrder
      };

      const response = await fetch(`${process.env.BASE_URL}/customers/orders/weekly/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit weekly orders');
      }
      
      // Refresh orders after submission
      await fetchWeeklyOrders();
      alert('Weekly orders submitted successfully!');
    } catch (error) {
      console.error('Error submitting weekly orders:', error);
      alert('Failed to submit weekly orders. Please try again.');
    }
  };

  const calculateChickenAmount = (chickenOrder: { type: string; quantity: number }) => {
    const pricePerChicken = chickenOrder.type === 'SASSO' ? 3500 : 3000;
    return chickenOrder.quantity * pricePerChicken;
  };

  const calculateFeedAmount = (feedOrders: Array<{ type: string; quantity: number }>) => {
    const feedPrices: { [key: string]: number } = {
      'BROILER_STARTER': 25000,
      'BROILER_GROWER': 25000,
      'BROILER_FINISHER': 25000,
      'LAYER_STARTER': 25000,
      'LAYER_GROWER': 25000,
      'COMPLETE_LAYER_MASH': 25000,
    };
    
    return feedOrders.reduce((total, feed) => {
      const price = feedPrices[feed.type] || 25000;
      return total + (feed.quantity * price);
    }, 0);
  };

  const calculateTotalAmount = (customer: WeeklyOrder['consolidatedOrder']['customerDetails'][0]) => {
    const chickenAmount = calculateChickenAmount(customer.chickenOrder);
    const feedAmount = calculateFeedAmount(customer.feedOrders);
    return chickenAmount + feedAmount;
  };

  const getCompanyOrdersSummary = () => {
    if (!orders) return { pending: 0, inProgress: 0, delivered: 0, completed: 0 };
    
    const companyOrders = orders.consolidatedOrder.companyOrders;
    const totalOrders = Object.keys(companyOrders).length;
    
    return {
      pending: totalOrders, // All orders are pending in this case
      inProgress: 0,
      delivered: 0,
      completed: 0
    };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">No weekly orders data available</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#066b3a]">Weekly Consolidated Orders</h1>
        
        {/* Date Range Selector */}
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm text-gray-900"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm text-gray-900"
              />
            </div>
            <div className="w-full sm:w-auto self-end">
              <button
                onClick={fetchWeeklyOrders}
                className="w-full sm:w-auto px-4 py-2 bg-[#066b3a] text-white rounded-md hover:bg-[#044d29] transition-colors"
              >
                Filter Orders
              </button>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mt-4">
          Showing orders from {new Date(dateRange.startDate).toLocaleDateString()} to{' '}
          {new Date(dateRange.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-2xl font-bold">{getCompanyOrdersSummary().pending}</span>
          </div>
          <h3 className="text-lg font-semibold">Pending Orders</h3>
        </div>

        <div className="bg-green-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold">{getCompanyOrdersSummary().inProgress}</span>
          </div>
          <h3 className="text-lg font-semibold">In Progress</h3>
        </div>

        <div className="bg-yellow-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span className="text-2xl font-bold">{getCompanyOrdersSummary().delivered}</span>
          </div>
          <h3 className="text-lg font-semibold">Out for Delivery</h3>
        </div>

        <div className="bg-purple-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-bold">{getCompanyOrdersSummary().completed}</span>
          </div>
          <h3 className="text-lg font-semibold">Completed</h3>
        </div>
      </div>

      {/* Company Orders Summary */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCompanyOrdersExpanded(!isCompanyOrdersExpanded)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isCompanyOrdersExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Company Orders Summary</h2>
                <p className="text-sm text-gray-600">
                  Orders from {new Date(orders.weekStartDate).toLocaleDateString()} to{' '}
                  {new Date(orders.weekEndDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {isCompanyOrdersExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(orders.consolidatedOrder.companyOrders).map(([key, company]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{company.companyName}</h3>
                  <div className="space-y-4 text-gray-900">
                    <div>
                      <h4 className="font-medium text-gray-900">Chickens</h4>
                      <p>Type: {company.orders.chickens.type}</p>
                      <p>Quantity: {company.orders.chickens.quantity.toLocaleString()}</p>
                    </div>
                    {company.orders.feeds.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900">Feeds</h4>
                        <div className="space-y-2 text-gray-900">
                          {company.orders.feeds.map((feed, index) => (
                            <div key={index} className="bg-white p-2 rounded text-gray-900">
                              <p>Type: {feed.type}</p>
                              <p>Quantity: {feed.quantity.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly Breakdown Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Orders Breakdown</h2>
        </div>
        <div className="p-4">
          {orders.consolidatedOrder.weeklyBreakdown.map((week, weekIndex) => (
            <div key={weekIndex} className="mb-8 last:mb-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWeekExpansion(weekIndex)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    {expandedWeeks[weekIndex] ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  <h3 className="text-md font-semibold text-gray-900">
                    Week {weekIndex + 1}: {new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    week.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    week.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {week.status}
                  </span>
                  {week.status === 'PENDING' && (
                    <button
                      onClick={handleSubmitWeeklyOrders}
                      className="px-4 py-2 bg-[#066b3a] text-white rounded-md hover:bg-[#044d29] transition-colors text-sm"
                    >
                      Submit Week&apos;s Orders
                    </button>
                  )}
                </div>
              </div>
              
              {expandedWeeks[weekIndex] && (
                <>
                  {week.orders.map((dayOrder, dayIndex) => (
                    <div key={dayIndex} className="bg-gray-50 rounded-lg p-4 mb-4 last:mb-0">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Orders for {new Date(dayOrder.date).toLocaleDateString()}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {dayOrder.orders.map((order, orderIndex) => (
                          <div key={orderIndex} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">{order.customerName}</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Chickens:</span>
                                <span className="text-gray-900">{order.quantity} {order.chickenType}</span>
                              </div>
                              {order.feeds.length > 0 && (
                                <div>
                                  <span className="text-gray-600">Feeds:</span>
                                  {order.feeds.map((feed, feedIndex) => (
                                    <div key={feedIndex} className="flex justify-between pl-4">
                                      <span className="text-gray-900">{feed.type}:</span>
                                      <span className="text-gray-900">{feed.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Orders Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customer Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chickens
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chicken Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feeds
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feed Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.consolidatedOrder.customerDetails.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ORD-{new Date().getFullYear()}-{String(index + 1).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(orders.consolidatedOrder.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.chickenOrder.type === 'SASSO' ? 'SILVERLAND' : 'IVRINE'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.chickenOrder.quantity.toLocaleString()} {customer.chickenOrder.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateChickenAmount(customer.chickenOrder).toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.feedOrders.map((feed, idx) => (
                      <div key={idx}>
                        {feed.quantity} {feed.type}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateFeedAmount(customer.feedOrders).toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {calculateTotalAmount(customer).toLocaleString()} TZS
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder({
                        customer,
                        orderNumber: `ORD-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
                        date: orders.consolidatedOrder.orderDate
                      })}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">PENDING</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{selectedOrder.customer.chickenOrder.type === 'SASSO' ? 'SILVERLAND' : 'IVRINE'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                
                {/* Chickens */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Chickens</h4>
                  <div className="bg-white rounded p-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{selectedOrder.customer.chickenOrder.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Quantity</p>
                        <p className="font-medium">{selectedOrder.customer.chickenOrder.quantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">
                          {calculateChickenAmount(selectedOrder.customer.chickenOrder).toLocaleString()} TZS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feeds */}
                <div>
                  <h4 className="font-medium mb-2">Feeds</h4>
                  <div className="space-y-2">
                    {selectedOrder.customer.feedOrders.map((feed, index) => (
                      <div key={index} className="bg-white rounded p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium">{feed.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium">{feed.quantity.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Don&apos;t worry if you can&apos;t see all your orders. They&apos;ll appear here once processed.
      </p>
    </div>
  );
} 