'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  center: string;
  centers: string[];
}

interface ChickenTracking {
  id: string;
  customerId: string;
  totalOrdered: number;
  totalReceived: number;
  lastDeliveryDate: string | null;
  currentBatch: {
    startDate: string;
    currentCount: number;
    initialCount: number;
    bandaCondition: string;
    progressHistory: Array<{
      date: string;
      notes: string;
      deadCount: number;
      sickCount: number;
      soldCount: number;
      averageAge: number;
      currentCount: number;
      averageWeight: number;
      bandaCondition: string;
    }>;
    lastInspectionDate: string;
    totalChickenCount: number;
    remainingChickenCount: number;
  };
}

interface Sale {
  id: string;
  paymentType: 'LOAN' | 'CASH';
  items: Array<{
    quantity: number;
    productId: string;
    unitPrice: string;
    totalPrice: number;
    productName: string;
  }>;
  totalAmount: string;
  amountPaid: string;
  remainingAmount: string;
  createdById: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  sex: 'MALE' | 'FEMALE';
  center: string;
  farmingPlace: string;
  village: string;
  street: string;
  district: string;
  region: string;
  state: string;
  chickenOrders: Array<{
    id: string;
    chickenPaid: number;
    chickenLoan: number;
    totalChicken: number;
    typeOfChicken: string;
    paymentStatus: string;
    pricePerChicken: string;
    totalChickenPrice: string;
    amountPaid: string;
    deliveryDate: string;
    receivingStatus: string;
    ward: string;
    village: string;
    phone: string;
    round: number;
    orderDate: string;
    feedOrders: Array<{
      id: string;
      feedType: string;
      company: string;
      quantity: string;
      pricePerUnit: string;
      totalPrice: string;
    }>;
  }>;
  chickenTrackings: Array<ChickenTracking>;
  sales: Array<Sale>;
}

type FeedType = 
  // Arvines Feeds
  | 'BROILER_STARTER_MP' | 'BROILER_STARTER_MV' 
  | 'BROILER_GROWER_MP' | 'BROILER_GROWER_MV'
  | 'GROWER_MP' | 'GROWER_MV'
  // Silverland Feeds
  | 'BROILER_STARTER' | 'BROILER_GROWER' | 'BROILER_FINISHER'
  | 'LAYER_STARTER' | 'LAYER_GROWER' | 'COMPLETE_LAYER_MASH'
  // Backbones Feeds
  | 'BACKBONE_LAYER_STARTER' | 'BACKBONE_LAYER_GROWER' | 'BACKBONE_COMPLETE_LAYER_MASH'
  // Local Feed
  | 'LOCAL_FEED';

interface NewCustomer {
  name: string;
  phone: string;
  sex: 'MALE' | 'FEMALE';
  farmingPlace: string;
  village: string;
  street: string;
  district: string;
  region: string;
  state: string;
  order: {
    chickenPaid: number;
    chickenLoan: number;
    pricePerChicken: number;
    typeOfChicken: 'SASSO' | 'BROILER';
    deliveryDate: string;
    feedOrders: Array<{
      feedType: FeedType;
      company: string;
      quantity: number;
      pricePerUnit: number;
    }>;
  };
}

interface FeedOrder {
  id: string;
  feedType: string;
  company: string;
  quantity: string;
  pricePerUnit: string;
  totalPrice: string;
}

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
}

function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details - {customer.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Batches/Orders Section */}
        <div className="space-y-6">
          {customer.chickenOrders.map((order: Customer['chickenOrders'][0]) => (
            <div key={order.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Batch #{order.round} - {new Date(order.orderDate).toLocaleDateString()}
              </h3>
              
              {/* Chicken Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Chickens</p>
                  <p className="font-semibold">Total: {order.totalChicken}</p>
                  <p className="text-sm">Paid: {order.chickenPaid}</p>
                  <p className="text-sm">Loan: {order.chickenLoan}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Payment</p>
                  <p className="font-semibold">Status: {order.paymentStatus}</p>
                  <p className="text-sm">Total: {order.totalChickenPrice}</p>
                  <p className="text-sm">Paid: {order.amountPaid}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Delivery</p>
                  <p className="font-semibold">Status: {order.receivingStatus}</p>
                  <p className="text-sm">Date: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                  <p className="text-sm">Type: {order.typeOfChicken}</p>
                </div>
              </div>

              {/* Feed Orders */}
              {order.feedOrders.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Feed Orders</h4>
                  <div className="bg-gray-50 rounded p-3">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price/Unit</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.feedOrders.map((feed: FeedOrder) => (
                          <tr key={feed.id}>
                            <td className="px-4 py-2">{feed.feedType}</td>
                            <td className="px-4 py-2">{feed.company}</td>
                            <td className="px-4 py-2">{feed.quantity}</td>
                            <td className="px-4 py-2">{feed.pricePerUnit}</td>
                            <td className="px-4 py-2">{feed.totalPrice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tracking History - Placeholder for now */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Tracking History</h4>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-500">No tracking history available</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    name: '',
    phone: '',
    sex: 'MALE',
    farmingPlace: '',
    village: '',
    street: '',
    district: '',
    region: '',
    state: 'Tanzania',
    order: {
      chickenPaid: 0,
      chickenLoan: 0,
      pricePerChicken: 3500,
      typeOfChicken: 'SASSO',
      deliveryDate: '',
      feedOrders: []
    }
  });
  const [currentFeedOrder, setCurrentFeedOrder] = useState<{
    feedType: FeedType;
    company: string;
    quantity: number;
    pricePerUnit: number;
  }>({
    feedType: 'BROILER_STARTER',
    company: 'SILVERLAND',
    quantity: 0,
    pricePerUnit: 25000
  });
  const selectedCenter = searchParams.get('center');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!selectedCenter) return;
      
      try {
        const token = localStorage.getItem('token');
        const endpoint = selectedCenter === 'ALL' 
          ? `${process.env.BASE_URL}/customers` 
          : `${process.env.BASE_URL}/customers?center=${selectedCenter}`;
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [selectedCenter]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!selectedCenter) {
    router.push('/dashboard/customers');
    return null;
  }

  const summaryCards = [
    {
      title: 'Total Customers',
      value: customers.length,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Male Customers',
      value: customers.filter(c => c.sex === 'MALE').length,
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Female Customers',
      value: customers.filter(c => c.sex === 'FEMALE').length,
      icon: UserGroupIcon,
      color: 'bg-yellow-500'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...newCustomer,
        center: selectedCenter,
        order: {
          ...newCustomer.order,
          chickenPaid: Number(newCustomer.order.chickenPaid),
          chickenLoan: Number(newCustomer.order.chickenLoan),
          pricePerChicken: Number(newCustomer.order.pricePerChicken),
          feedOrders: newCustomer.order.feedOrders.map(order => ({
            ...order,
            quantity: Number(order.quantity),
            pricePerUnit: Number(order.pricePerUnit)
          }))
        }
      };

      const response = await fetch(`${process.env.BASE_URL}/customers/with-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      // Reset form and close modal
      setIsModalOpen(false);
      setNewCustomer({
        name: '',
        phone: '',
        sex: 'MALE',
        farmingPlace: '',
        village: '',
        street: '',
        district: '',
        region: '',
        state: 'Tanzania',
        order: {
          chickenPaid: 0,
          chickenLoan: 0,
          pricePerChicken: 3500,
          typeOfChicken: 'SASSO',
          deliveryDate: '',
          feedOrders: []
        }
      });

      // Refresh customer list
      const updatedResponse = await fetch(`${process.env.BASE_URL}/customers?center=${selectedCenter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setCustomers(updatedData);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert(error instanceof Error ? error.message : 'Failed to create customer');
    }
  };

  const addFeedOrder = () => {
    setNewCustomer({
      ...newCustomer,
      order: {
        ...newCustomer.order,
        feedOrders: [...newCustomer.order.feedOrders, currentFeedOrder]
      }
    });
    setCurrentFeedOrder({
      feedType: 'BROILER_STARTER',
      company: 'SILVERLAND',
      quantity: 0,
      pricePerUnit: 25000
    });
  };

  const removeFeedOrder = (index: number) => {
    setNewCustomer({
      ...newCustomer,
      order: {
        ...newCustomer.order,
        feedOrders: newCustomer.order.feedOrders.filter((_, i) => i !== index)
      }
    });
  };

  // const handleViewDetails = (customer: Customer) => {
  //   setSelectedCustomer(customer);
  //   setShowDetailsModal(true);
  // };

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="mb-4 flex items-center text-[#066b3a] hover:text-[#044d29] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Centers
        </button>
        <h1 className="text-2xl font-bold text-[#066b3a]">{selectedCenter} Customers</h1>
        <p className="text-gray-600">Manage and view customer information</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`${card.color} rounded-lg shadow-lg p-6 text-white`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="h-8 w-8" />
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <h3 className="text-lg font-semibold">{card.title}</h3>
          </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Customer List</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#066b3a] hover:bg-[#044d29] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Customer
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Phone
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Location
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {customer.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.phone}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.farmingPlace}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="inline-flex items-center rounded-md bg-[#066b3a] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#044d29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#066b3a]"
                            >
                              View Customer
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Customer</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-900">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-900">Sex</label>
                  <select
                    id="sex"
                    value={newCustomer.sex}
                    onChange={(e) => setNewCustomer({ ...newCustomer, sex: e.target.value as 'MALE' | 'FEMALE' })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="farmingPlace" className="block text-sm font-medium text-gray-900">Farming Place</label>
                  <input
                    type="text"
                    id="farmingPlace"
                    value={newCustomer.farmingPlace}
                    onChange={(e) => setNewCustomer({ ...newCustomer, farmingPlace: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="village" className="block text-sm font-medium text-gray-900">Village</label>
                  <input
                    type="text"
                    id="village"
                    value={newCustomer.village}
                    onChange={(e) => setNewCustomer({ ...newCustomer, village: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-900">Street</label>
                  <input
                    type="text"
                    id="street"
                    value={newCustomer.street}
                    onChange={(e) => setNewCustomer({ ...newCustomer, street: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-900">District</label>
                  <input
                    type="text"
                    id="district"
                    value={newCustomer.district}
                    onChange={(e) => setNewCustomer({ ...newCustomer, district: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-900">Region</label>
                  <input
                    type="text"
                    id="region"
                    value={newCustomer.region}
                    onChange={(e) => setNewCustomer({ ...newCustomer, region: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-900">State</label>
                  <input
                    type="text"
                    id="state"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Order Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="chickenPaid" className="block text-sm font-medium text-gray-900">Chickens Paid</label>
                    <input
                      type="number"
                      id="chickenPaid"
                      value={newCustomer.order.chickenPaid}
                      onChange={(e) => setNewCustomer({
                        ...newCustomer,
                        order: { ...newCustomer.order, chickenPaid: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="chickenLoan" className="block text-sm font-medium text-gray-900">Chickens on Loan</label>
                    <input
                      type="number"
                      id="chickenLoan"
                      value={newCustomer.order.chickenLoan}
                      onChange={(e) => setNewCustomer({
                        ...newCustomer,
                        order: { ...newCustomer.order, chickenLoan: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pricePerChicken" className="block text-sm font-medium text-gray-900">Price per Chicken</label>
                    <input
                      type="number"
                      id="pricePerChicken"
                      value={newCustomer.order.pricePerChicken}
                      onChange={(e) => setNewCustomer({
                        ...newCustomer,
                        order: { ...newCustomer.order, pricePerChicken: Number(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="typeOfChicken" className="block text-sm font-medium text-gray-900">Type of Chicken</label>
                    <select
                      id="typeOfChicken"
                      value={newCustomer.order.typeOfChicken}
                      onChange={(e) => setNewCustomer({
                        ...newCustomer,
                        order: { ...newCustomer.order, typeOfChicken: e.target.value as 'SASSO' | 'BROILER' }
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                      required
                    >
                      <option value="SASSO">SASSO</option>
                      <option value="BROILER">BROILER</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-900">Delivery Date</label>
                    <input
                      type="date"
                      id="deliveryDate"
                      value={newCustomer.order.deliveryDate}
                      onChange={(e) => setNewCustomer({
                        ...newCustomer,
                        order: { ...newCustomer.order, deliveryDate: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Feed Orders */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feed Orders</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label htmlFor="feedType" className="block text-sm font-medium text-gray-900">Feed Type</label>
                    <select
                      id="feedType"
                      value={currentFeedOrder.feedType}
                      onChange={(e) => {
                        const selectedFeedType = e.target.value;
                        // Reset company when feed type changes to ensure compatibility
                        let defaultCompany = 'SILVERLAND';
                        
                        // Set appropriate default company based on feed type
                        if (selectedFeedType.includes('MP') || selectedFeedType.includes('MV')) {
                          defaultCompany = 'ARVINES';
                        } else if (selectedFeedType.startsWith('LAYER')) {
                          defaultCompany = 'SILVERLAND'; // Default to SILVERLAND for layer feeds
                        }
                        
                        setCurrentFeedOrder({ 
                          ...currentFeedOrder, 
                          feedType: selectedFeedType as FeedType,
                          company: defaultCompany
                        });
                      }}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    >
                      <optgroup label="Arvines Feeds">
                        <option value="BROILER_STARTER_MP">Broiler Starter MP</option>
                        <option value="BROILER_STARTER_MV">Broiler Starter MV</option>
                        <option value="BROILER_GROWER_MP">Broiler Grower MP</option>
                        <option value="BROILER_GROWER_MV">Broiler Grower MV</option>
                        <option value="GROWER_MP">Grower MP</option>
                        <option value="GROWER_MV">Grower MV</option>
                      </optgroup>
                      <optgroup label="Silverland Feeds">
                        <option value="BROILER_STARTER">Broiler Starter</option>
                        <option value="BROILER_GROWER">Broiler Grower</option>
                        <option value="BROILER_FINISHER">Broiler Finisher</option>
                        <option value="LAYER_STARTER">Layer Starter</option>
                        <option value="LAYER_GROWER">Layer Grower</option>
                        <option value="COMPLETE_LAYER_MASH">Complete Layer Mash</option>
                      </optgroup>
                      <optgroup label="Backbones Feeds">
                        <option value="BACKBONE_LAYER_STARTER">Layer Starter</option>
                        <option value="BACKBONE_LAYER_GROWER">Layer Grower</option>
                        <option value="BACKBONE_COMPLETE_LAYER_MASH">Complete Layer Mash</option>
                      </optgroup>
                      <optgroup label="Local Feed">
                        <option value="LOCAL_FEED">Local Feed</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-900">Company</label>
                    <select
                      id="company"
                      value={currentFeedOrder.company}
                      onChange={(e) => setCurrentFeedOrder({ ...currentFeedOrder, company: e.target.value })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    >
                      {currentFeedOrder.feedType.includes('MP') || currentFeedOrder.feedType.includes('MV') ? (
                        <option value="ARVINES">Arvines</option>
                      ) : currentFeedOrder.feedType.startsWith('BACKBONE') ? (
                        <option value="BACKBONES">Backbones</option>
                      ) : currentFeedOrder.feedType === 'LOCAL_FEED' ? (
                        <option value="LOCAL">Local</option>
                      ) : (
                        <option value="SILVERLAND">Silverland</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-900">Quantity</label>
                    <input
                      type="number"
                      id="quantity"
                      value={currentFeedOrder.quantity}
                      onChange={(e) => setCurrentFeedOrder({ ...currentFeedOrder, quantity: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-900">Price per Unit</label>
                    <input
                      type="number"
                      id="pricePerUnit"
                      value={currentFeedOrder.pricePerUnit}
                      onChange={(e) => setCurrentFeedOrder({ ...currentFeedOrder, pricePerUnit: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-2 border-gray-400 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] text-base py-3 px-4 text-gray-900"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addFeedOrder}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium text-gray-900"
                >
                  Add Feed Order
                </button>

                {/* Feed Orders List */}
                {newCustomer.order.feedOrders.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Added Feed Orders:</h4>
                    <div className="space-y-2">
                      {newCustomer.order.feedOrders.map((feedOrder, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-gray-900">
                          <span className="text-sm text-gray-900">
                            {feedOrder.quantity} x {feedOrder.feedType} ({feedOrder.company}) @ {feedOrder.pricePerUnit}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeedOrder(index)}
                            className="text-red-500 hover:text-red-700 text-gray-900"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] hover:bg-[#044d29] text-white rounded-md text-sm font-medium"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal 
          customer={selectedCustomer} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}
    </div>
  );
}

export default function CustomersList() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    }>
      <CustomerListContent />
    </Suspense>
  );
} 