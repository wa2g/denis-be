'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  // paymentHistory: Array<any>;
  createdById: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
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
    batch: number;
    orderDate: string;
    createdAt: string;
    updatedAt: string;
    customerId: string;
    feedOrders: Array<{
      id: string;
      feedType: string;
      company: string;
      quantity: string;
      pricePerUnit: string;
      totalPrice: string;
      chickenOrderId: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  chickenTrackings: Array<ChickenTracking>;
  sales: Array<Sale>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    center: string;
    isActive: boolean;
  };
}

interface ExpandedStates {
  [key: string]: {
    details: boolean;
    tracking: boolean;
    orders: boolean;
    sales: boolean;
  };
}

interface BatchTracking {
  initialCount: number;
  currentCount: number;
  startDate: string;
  bandaCondition: 'GOOD' | 'FAIR' | 'POOR';
  lastInspectionDate: string;
  sickCount: number;
  deadCount: number;
  soldCount: number;
  averageWeight: number;
  averageAge: number;
}

export interface FarmVisit {
  date: string;
  purpose: string;
  findings: string;
  recommendations: string;
}

interface BatchProgress {
  totalDays: number;
  currentDay: number;
  percentageComplete: number;
}

interface ProgressHistoryEntry {
  date: string;
  notes: string;
  deadCount: number;
  sickCount: number;
  soldCount: number;
  averageAge: number;
  currentCount: number;
  averageWeight: number;
  bandaCondition: string;
}

interface BatchHealthStatus {
  deadCount: number;
  sickCount: number;
  soldCount: number;
  averageAge: number;
  averageWeight: number;
  mortalityRate: number;
  survivalRate: number;
}

interface BatchData {
  endDate: string;
  startDate: string;
  currentCount: number;
  healthStatus: BatchHealthStatus;
  initialCount: number;
  bandaCondition: string;
  progressHistory: ProgressHistoryEntry[];
  lastInspectionDate: string;
}

interface ChickenTracking {
  id: string;
  customerId: string;
  totalOrdered: number;
  totalReceived: number;
  lastDeliveryDate: string | null;
  pendingDeliveries: PendingDelivery[];
  currentBatch: {
    startDate: string;
    currentCount: number;
    initialCount: number;
    bandaCondition: string;
    progressHistory: ProgressHistoryEntry[];
    lastInspectionDate: string;
    totalChickenCount: number;
    remainingChickenCount: number;
    batchProgress: BatchProgress;
  };
  healthStatus: BatchHealthStatus;
  farmVisits: Array<{
    date: string;
    purpose: string;
    findings: string;
    recommendations: string;
  }>;
  batchHistory: BatchData[];
  createdAt: string;
  updatedAt: string;
}

interface PendingDelivery {
  date: string;
  quantity: number;
  status: string;
}

interface ChickenBatchOrder {
  id: string;
  batchNumber: number;
  createdAt: string;
  totalChickens: number;
  chickensPaid: number;
  chickensOnLoan: number;
  chickenType: string;
  paymentStatus: string;
  pricePerChicken: number;
  totalAmount: number;
  amountPaid: number;
  deliveryStatus: string;
  deliveryDate: string;
  deliveryLocation: string;
  feedOrders: Array<{
    id: string;
    feedType: string;
    company: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
  }>;
}

export default function CustomerDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStates, setExpandedStates] = useState<ExpandedStates>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>('');
  const [paymentEvidence, setPaymentEvidence] = useState<File | null>(null);
  const [showBatchTrackingModal, setShowBatchTrackingModal] = useState(false);
  const [showFarmVisitModal, setShowFarmVisitModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchOrder, setNewBatchOrder] = useState({
    chickenPaid: 0,
    chickenLoan: 0,
    totalChicken: 0,
    typeOfChicken: 'SASSO',
    pricePerChicken: 3500,
    paymentStatus: 'PARTIAL',
    amountPaid: 0,
    ward: '',
    village: '',
    phone: '',
    batch: 1,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    feedOrders: [] as Array<{
      feedType: string;
      company: string;
      quantity: number;
      pricePerUnit: number;
    }>
  });
  const [batchTracking, setBatchTracking] = useState<BatchTracking>({
    initialCount: 0,
    currentCount: 0,
    startDate: '',
    bandaCondition: 'GOOD',
    lastInspectionDate: '',
    sickCount: 0,
    deadCount: 0,
    soldCount: 0,
    averageWeight: 0,
    averageAge: 0
  });
  const [farmVisit, setFarmVisit] = useState({
    date: '',
    purpose: '',
    findings: '',
    recommendations: ''
  });
  const [chickenTrackingData, setChickenTrackingData] = useState<ChickenTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [batchOrdersLoading, setBatchOrdersLoading] = useState(false);
  const [chickenBatchOrders, setChickenBatchOrders] = useState<ChickenBatchOrder[]>([]);
  const resolvedParams = use(params);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/customers/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const fetchChickenTracking = async (customerId: string) => {
    setTrackingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/customers/${customerId}/chicken-tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch chicken tracking data');
      
      const data = await response.json();
      console.log('API Response:', data);

      // Handle both array and single object responses
      const trackingData = Array.isArray(data) ? data[0] : data;

      if (trackingData) {
        const processedData = {
          id: trackingData.id,
          customerId: trackingData.customerId,
          totalOrdered: trackingData.totalOrdered || 0,
          totalReceived: trackingData.totalReceived || 0,
          lastDeliveryDate: trackingData.lastDeliveryDate,
          pendingDeliveries: trackingData.pendingDeliveries || [],
          currentBatch: {
            startDate: trackingData.currentBatch?.startDate || '',
            currentCount: trackingData.currentBatch?.currentCount || 0,
            initialCount: trackingData.currentBatch?.initialCount || 0,
            bandaCondition: trackingData.currentBatch?.bandaCondition || 'Not inspected',
            progressHistory: trackingData.currentBatch?.progressHistory || [],
            lastInspectionDate: trackingData.currentBatch?.lastInspectionDate || '',
            totalChickenCount: trackingData.currentBatch?.totalChickenCount || 0,
            remainingChickenCount: trackingData.currentBatch?.remainingChickenCount || 0,
            batchProgress: trackingData.currentBatch?.batchProgress || { 
              currentDay: 0, 
              totalDays: 45, 
              percentageComplete: 0 
            }
          },
          healthStatus: {
            deadCount: trackingData.healthStatus?.deadCount || 0,
            sickCount: trackingData.healthStatus?.sickCount || 0,
            soldCount: trackingData.healthStatus?.soldCount || 0,
            averageAge: trackingData.healthStatus?.averageAge || 0,
            averageWeight: trackingData.healthStatus?.averageWeight || 0,
            mortalityRate: trackingData.healthStatus?.mortalityRate || 0,
            survivalRate: trackingData.healthStatus?.survivalRate || 0
          },
          farmVisits: trackingData.farmVisits || [],
          batchHistory: trackingData.batchHistory || [],
          createdAt: trackingData.createdAt,
          updatedAt: trackingData.updatedAt
        };

        console.log('Processed Tracking Data:', processedData);
        setChickenTrackingData(processedData);
      } else {
        console.log('No tracking data found');
        setChickenTrackingData(null);
      }
    } catch (error) {
      console.error('Error fetching chicken tracking data:', error);
      setChickenTrackingData(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const fetchChickenBatchOrders = async (customerId: string) => {
    setBatchOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/chicken-orders/customer/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chicken batch orders');
      }

      const data = await response.json();
      setChickenBatchOrders(data);
    } catch (error) {
      console.error('Error fetching chicken batch orders:', error);
    } finally {
      setBatchOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.id) {
      fetchCustomerDetails();
      fetchChickenTracking(resolvedParams.id);
      fetchChickenBatchOrders(resolvedParams.id);
    }
  }, [resolvedParams.id, fetchCustomerDetails]);

  const toggleSection = async (batchId: string, section: 'details' | 'tracking' | 'orders' | 'sales') => {
    setExpandedStates(prev => ({
      ...prev,
      [batchId]: {
        ...prev[batchId] || {
          details: false,
          tracking: false,
          orders: false,
          sales: false
        },
        [section]: !prev[batchId]?.[section]
      }
    }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !newPaymentAmount) return;

    try {
      const formData = new FormData();
      formData.append('amount', newPaymentAmount);
      if (paymentEvidence) {
        formData.append('evidence', paymentEvidence);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/sales/${selectedSale.id}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add payment');
      }

      // Refresh customer data
      await fetchCustomerDetails();
      setShowPaymentModal(false);
      setNewPaymentAmount('');
      setPaymentEvidence(null);
      setSelectedSale(null);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const calculateRemainingAfterNewPayment = () => {
    if (!selectedSale || !newPaymentAmount) return selectedSale?.remainingAmount;
    const remaining = parseFloat(selectedSale.remainingAmount) - parseFloat(newPaymentAmount);
    return remaining.toFixed(2);
  };

  const openPaymentModal = (sale: Sale) => {
    setSelectedSale(sale);
    setShowPaymentModal(true);
  };

  const handleBatchTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/customers/${resolvedParams.id}/batch-tracking`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchTracking),
      });

      if (!response.ok) {
        throw new Error('Failed to add batch tracking');
      }

      // Reset form and close modal
      setBatchTracking({
        initialCount: 0,
        currentCount: 0,
        startDate: '',
        bandaCondition: 'GOOD',
        lastInspectionDate: '',
        sickCount: 0,
        deadCount: 0,
        soldCount: 0,
        averageWeight: 0,
        averageAge: 0
      });
      setShowBatchTrackingModal(false);
      setSelectedBatchId(null);
      
      // Refresh customer data
      await fetchCustomerDetails();
    } catch (error) {
      console.error('Error adding batch tracking:', error);
    }
  };

  const handleFarmVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.BASE_URL}/customers/${resolvedParams.id}/farm-visits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmVisit),
      });

      if (!response.ok) {
        throw new Error('Failed to add farm visit');
      }

      // Reset form and close modal
      setFarmVisit({
        date: '',
        purpose: '',
        findings: '',
        recommendations: ''
      });
      setShowFarmVisitModal(false);
      setSelectedBatchId(null);
      
      // Refresh customer data
      await fetchCustomerDetails();
    } catch (error) {
      console.error('Error adding farm visit:', error);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Calculate total chicken
      const totalChicken = newBatchOrder.chickenPaid + newBatchOrder.chickenLoan;
      
      const payload = {
        ...newBatchOrder,
        totalChicken,
        customerId: resolvedParams.id,
        feedOrders: newBatchOrder.feedOrders.map(order => ({
          ...order,
          quantity: Number(order.quantity),
          pricePerUnit: Number(order.pricePerUnit)
        }))
      };

      const response = await fetch(`${process.env.BASE_URL}/chicken-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add batch order');
      }

      // Reset form and close modal
      setShowAddBatchModal(false);
      setNewBatchOrder({
        chickenPaid: 0,
        chickenLoan: 0,
        totalChicken: 0,
        typeOfChicken: 'SASSO',
        pricePerChicken: 3500,
        paymentStatus: 'PARTIAL',
        amountPaid: 0,
        ward: '',
        village: '',
        phone: '',
        batch: 1,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        feedOrders: []
      });

      // Refresh customer data
      await fetchCustomerDetails();
      await fetchChickenBatchOrders(resolvedParams.id);
    } catch (error) {
      console.error('Error adding batch order:', error);
      alert('Failed to add batch order. Please try again.');
    }
  };

  const addFeedOrder = () => {
    setNewBatchOrder(prev => ({
      ...prev,
      feedOrders: [
        ...prev.feedOrders,
        {
          feedType: 'BROILER_STARTER',
          company: 'SILVERLAND',
          quantity: 0,
          pricePerUnit: 25000
        }
      ]
    }));
  };

  const removeFeedOrder = (index: number) => {
    setNewBatchOrder(prev => ({
      ...prev,
      feedOrders: prev.feedOrders.filter((_, i) => i !== index)
    }));
  };

  const updateFeedOrder = (index: number, field: string, value: string | number) => {
    setNewBatchOrder(prev => ({
      ...prev,
      feedOrders: prev.feedOrders.map((order, i) => 
        i === index ? { ...order, [field]: value } : order
      )
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-[#066b3a] hover:text-[#044d29] transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-[#066b3a]">{customer.name}</h1>
        <p className="text-gray-600">Customer Details</p>
      </div>

      {/* Customer Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-900">Phone Number</p>
            <p className="font-medium text-gray-900">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Sex</p>
            <p className="font-medium text-gray-900">{customer.sex}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Center</p>
            <p className="font-medium text-gray-900">{customer.center}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Farming Place</p>
            <p className="font-medium text-gray-900">{customer.farmingPlace}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Village</p>
            <p className="font-medium text-gray-900">{customer.village}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">District</p>
            <p className="font-medium text-gray-900">{customer.district}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">Region</p>
            <p className="font-medium text-gray-900">{customer.region}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900">State</p>
            <p className="font-medium text-gray-900">{customer.state}</p>
          </div>
        </div>
      </div>

      {/* Batches Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Customer Batches</h2>
          <button
            onClick={() => setShowAddBatchModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#066b3a] hover:bg-[#044d29] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Batch
          </button>
        </div>

        {customer.chickenOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Batch #{order.batch || 'N/A'}
                </h3>
                <span className="text-sm text-gray-900">
                  Created on {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleSection(order.id, 'orders')}
                  className="inline-flex items-center px-3 py-2 border border-[#066b3a] text-sm font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white transition-colors"
                >
                  {expandedStates[order.id]?.orders ? <ChevronUpIcon className="h-5 w-5 mr-1" /> : <ChevronDownIcon className="h-5 w-5 mr-1" />}
                  Orders & Feeds
                </button>
                <button
                  onClick={() => toggleSection(order.id, 'tracking')}
                  className="inline-flex items-center px-3 py-2 border border-[#066b3a] text-sm font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white transition-colors"
                >
                  {expandedStates[order.id]?.tracking ? <ChevronUpIcon className="h-5 w-5 mr-1" /> : <ChevronDownIcon className="h-5 w-5 mr-1" />}
                  Tracking History
                </button>
                <button
                  onClick={() => toggleSection(order.id, 'sales')}
                  className="inline-flex items-center px-3 py-2 border border-[#066b3a] text-sm font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white transition-colors"
                >
                  {expandedStates[order.id]?.sales ? <ChevronUpIcon className="h-5 w-5 mr-1" /> : <ChevronDownIcon className="h-5 w-5 mr-1" />}
                  Sales
                </button>
              </div>
            </div>

            {/* Orders & Feeds Section */}
            {expandedStates[order.id]?.orders && (
              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-900">Chicken Order</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">Total Chickens: {order.totalChicken}</p>
                      <p className="text-sm text-gray-900">Paid: {order.chickenPaid}</p>
                      <p className="text-sm text-gray-900">Loan: {order.chickenLoan}</p>
                      <p className="text-sm text-gray-900">Type: {order.typeOfChicken}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-900">Payment Details</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">Status: {order.receivingStatus}
                        {order.receivingStatus !== 'APPROVED' && (
                          <button
                            onClick={async () => {
                              setLoading(true);
                              try {
                                const token = localStorage.getItem('token');
                                let newStatus;
                                if (order.receivingStatus === 'IN_PROGRESS') {
                                  newStatus = 'APPROVED';
                                } else if (order.receivingStatus === 'RECEIVED') {
                                  newStatus = 'PENDING';
                                } else {
                                  newStatus = 'IN_PROGRESS';
                                }
                                
                                const response = await fetch(`${process.env.BASE_URL}/chicken-orders/${order.id}/receiving-status`, {
                                  method: 'PATCH',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({ receivingStatus: newStatus }),
                                });
                                if (!response.ok) throw new Error('Failed to update receiving status');
                                await fetchCustomerDetails();
                              } catch (error) {
                                alert('Failed to update receiving status');
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="ml-2 px-2 py-1 text-xs rounded bg-[#066b3a] text-white hover:bg-[#044d29] disabled:opacity-50"
                            disabled={loading}
                          >
                            {loading ? 'Updating...' : 
                              order.receivingStatus === 'IN_PROGRESS' ? 'Mark as Approved to ship to customer' :
                              order.receivingStatus === 'RECEIVED' ? 'Mark as Pending' :
                              'Mark as In Progress'
                            }
                          </button>
                        )}
                      </p>
                      <p className="text-sm text-gray-900">Date: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-900">Location: {order.village}, {order.ward}</p>
                    </div>
                  </div>
                </div>

                {/* Feed Orders Table */}
                {order.feedOrders && order.feedOrders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-gray-900">Feed Orders</h4>
                    <div className="bg-gray-50 rounded-lg overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Feed Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Price/Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.feedOrders.map((feed) => (
                            <tr key={feed.id}>
                              <td className="px-6 py-4 text-sm text-gray-900">{feed.feedType}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{feed.company}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{feed.quantity}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{feed.pricePerUnit}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{feed.totalPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tracking Section */}
            {expandedStates[order.id]?.tracking && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Tracking History</h4>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBatchId(order.id);
                        setBatchTracking({
                          ...batchTracking,
                          initialCount: order.totalChicken,
                          currentCount: order.totalChicken,
                          startDate: order.deliveryDate
                        });
                        setShowBatchTrackingModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#066b3a] hover:bg-[#044d29]"
                    >
                      Add Batch Tracking
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBatchId(order.id);
                        setShowFarmVisitModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-[#066b3a] text-sm font-medium rounded-md text-[#066b3a] bg-white hover:bg-[#066b3a] hover:text-white"
                    >
                      Add Farm Visit
                    </button>
                  </div>
                </div>

                {trackingLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#066b3a]"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h5 className="text-lg font-medium mb-4 text-gray-900">Order Summary</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Total Ordered</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.totalOrdered || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Received</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.totalReceived || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Delivery Date</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.lastDeliveryDate 
                              ? new Date(chickenTrackingData.lastDeliveryDate).toLocaleDateString()
                              : 'No deliveries yet'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Batch Status */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h5 className="text-lg font-medium mb-4 text-gray-900">Current Batch Status</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Initial Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.initialCount || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.currentCount || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.startDate 
                              ? new Date(chickenTrackingData.currentBatch.startDate).toLocaleDateString()
                              : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Banda Condition</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.bandaCondition || 'Not inspected'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Inspection</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.lastInspectionDate 
                              ? new Date(chickenTrackingData.currentBatch.lastInspectionDate).toLocaleDateString()
                              : 'Not inspected yet'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Chicken Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.currentBatch?.totalChickenCount || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Batch Progress */}
                      <div className="mt-6">
                        <h6 className="text-sm font-medium mb-2 text-gray-900">Batch Progress</h6>
                        <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div 
                            className="h-full bg-[#066b3a] transition-all duration-300"
                            style={{ 
                              width: `${Math.max(0, Math.min(100, (chickenTrackingData?.currentBatch?.batchProgress?.percentageComplete || 0) + 100))}%` 
                            }}
                          ></div>
                        </div>
                        <div className="mt-2 flex justify-between text-sm text-gray-600">
                          <span>Day {chickenTrackingData?.currentBatch?.batchProgress?.currentDay || 0}</span>
                          <span>Total Days: {chickenTrackingData?.currentBatch?.batchProgress?.totalDays || 45}</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Status */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                      <h5 className="text-lg font-medium mb-4 text-gray-900">Health Status</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Sick Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.sickCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dead Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.deadCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sold Count</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.soldCount || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Average Weight</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.averageWeight 
                              ? `${chickenTrackingData.healthStatus.averageWeight} kg`
                              : 'Not measured'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Average Age</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.averageAge 
                              ? `${chickenTrackingData.healthStatus.averageAge} days`
                              : 'Not recorded'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Survival Rate</p>
                          <p className="text-lg font-medium text-gray-900">
                            {chickenTrackingData?.healthStatus?.survivalRate 
                              ? `${chickenTrackingData.healthStatus.survivalRate}%`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Batch History */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                      <h5 className="text-lg font-medium mb-4 text-gray-900">Batch History</h5>
                      {batchOrdersLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#066b3a]"></div>
                        </div>
                      ) : chickenBatchOrders.length > 0 ? (
                        <div className="space-y-4">
                          {chickenBatchOrders.map((batch) => (
                            <div key={batch.id} className="border rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Batch Number</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    #{batch.batchNumber}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Total Chickens</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {batch.totalChickens} ({batch.chickenType})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Payment Status</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {batch.paymentStatus}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No batch history available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sales Section */}
            {expandedStates[order.id]?.sales && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Sales Records</h4>
                  <button
                    onClick={() => {
                      setSelectedSale(null);
                      setShowPaymentModal(true);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#066b3a] hover:bg-[#044d29]"
                  >
                    Add New Sale
                  </button>
                </div>

                {customer.sales.length > 0 ? (
                  <div className="space-y-4">
                    {customer.sales.map((sale) => (
                      <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="font-medium text-gray-900">{sale.totalAmount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Amount Paid</p>
                            <p className="font-medium text-gray-900">{sale.amountPaid}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className="font-medium text-gray-900">{sale.remainingAmount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Payment Type</p>
                            <p className="font-medium text-gray-900">{sale.paymentType}</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium mb-2 text-gray-900">Items Sold</h5>
                          <div className="space-y-2">
                            {sale.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-white p-3 rounded shadow-sm">
                                <p className="text-sm text-gray-900">{item.productName}</p>
                                <div className="grid grid-cols-3 gap-4 mt-1">
                                  <div>
                                    <span className="text-xs text-gray-500">Qty: </span>
                                    {item.quantity}
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Price: </span>
                                    {item.unitPrice}
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">Total: </span>
                                    {item.totalPrice}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => openPaymentModal(sale)}
                            className="text-sm px-3 py-1 bg-[#066b3a] text-white rounded hover:bg-[#044d29]"
                          >
                            Add Payment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No sales records found</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedSale(null);
                  setNewPaymentAmount('');
                  setPaymentEvidence(null);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Current Remaining Amount</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {selectedSale.remainingAmount}
                </div>
              </div>

              <div>
                <label htmlFor="newPayment" className="block text-sm font-medium text-gray-900">New Payment Amount</label>
                <input
                  type="number"
                  id="newPayment"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  max={selectedSale.remainingAmount}
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Remaining After Payment</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-md">
                  {calculateRemainingAfterNewPayment()}
                </div>
              </div>

              <div>
                <label htmlFor="evidence" className="block text-sm font-medium text-gray-900">Payment Evidence</label>
                <input
                  type="file"
                  id="evidence"
                  onChange={(e) => setPaymentEvidence(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-[#066b3a] file:text-white
                    hover:file:bg-[#044d29]"
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedSale(null);
                    setNewPaymentAmount('');
                    setPaymentEvidence(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#066b3a] hover:bg-[#044d29]"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Tracking Modal */}
      {showBatchTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Batch Tracking</h3>
              <button
                onClick={() => {
                  setShowBatchTrackingModal(false);
                  setSelectedBatchId(null);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBatchTrackingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Initial Count</label>
                  <input
                    type="number"
                    value={batchTracking.initialCount}
                    onChange={(e) => setBatchTracking({ ...batchTracking, initialCount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Current Count</label>
                  <input
                    type="number"
                    value={batchTracking.currentCount}
                    onChange={(e) => setBatchTracking({ ...batchTracking, currentCount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Start Date</label>
                <input
                  type="date"
                  value={batchTracking.startDate}
                  onChange={(e) => setBatchTracking({ ...batchTracking, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Banda Condition</label>
                <select
                  value={batchTracking.bandaCondition}
                  onChange={(e) => setBatchTracking({ ...batchTracking, bandaCondition: e.target.value as 'GOOD' | 'FAIR' | 'POOR' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                >
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Last Inspection Date</label>
                <input
                  type="date"
                  value={batchTracking.lastInspectionDate}
                  onChange={(e) => setBatchTracking({ ...batchTracking, lastInspectionDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Sick Count</label>
                  <input
                    type="number"
                    value={batchTracking.sickCount}
                    onChange={(e) => setBatchTracking({ ...batchTracking, sickCount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Dead Count</label>
                  <input
                    type="number"
                    value={batchTracking.deadCount}
                    onChange={(e) => setBatchTracking({ ...batchTracking, deadCount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Sold Count</label>
                  <input
                    type="number"
                    value={batchTracking.soldCount}
                    onChange={(e) => setBatchTracking({ ...batchTracking, soldCount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Average Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={batchTracking.averageWeight}
                    onChange={(e) => setBatchTracking({ ...batchTracking, averageWeight: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Average Age (days)</label>
                <input
                  type="number"
                  value={batchTracking.averageAge}
                  onChange={(e) => setBatchTracking({ ...batchTracking, averageAge: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchTrackingModal(false);
                    setSelectedBatchId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] hover:bg-[#044d29] text-white rounded-md text-sm font-medium"
                >
                  Save Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farm Visit Modal */}
      {showFarmVisitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Farm Visit</h3>
              <button
                onClick={() => {
                  setShowFarmVisitModal(false);
                  setSelectedBatchId(null);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFarmVisitSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Date</label>
                <input
                  type="date"
                  value={farmVisit.date}
                  onChange={(e) => setFarmVisit({ ...farmVisit, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Purpose</label>
                <input
                  type="text"
                  value={farmVisit.purpose}
                  onChange={(e) => setFarmVisit({ ...farmVisit, purpose: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Findings</label>
                <textarea
                  value={farmVisit.findings}
                  onChange={(e) => setFarmVisit({ ...farmVisit, findings: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Recommendations</label>
                <textarea
                  value={farmVisit.recommendations}
                  onChange={(e) => setFarmVisit({ ...farmVisit, recommendations: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFarmVisitModal(false);
                    setSelectedBatchId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] hover:bg-[#044d29] text-white rounded-md text-sm font-medium"
                >
                  Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showAddBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Batch Order</h2>
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-6">
              {/* Chicken Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Chickens Paid</label>
                  <input
                    type="number"
                    value={newBatchOrder.chickenPaid}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      chickenPaid: Number(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Chickens on Loan</label>
                  <input
                    type="number"
                    value={newBatchOrder.chickenLoan}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      chickenLoan: Number(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Type of Chicken</label>
                  <select
                    value={newBatchOrder.typeOfChicken}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      typeOfChicken: e.target.value,
                      pricePerChicken: e.target.value === 'SASSO' ? 3500 : 3000
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  >
                    <option value="SASSO">SASSO</option>
                    <option value="BROILER">BROILER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Price per Chicken</label>
                  <input
                    type="number"
                    value={newBatchOrder.pricePerChicken}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      pricePerChicken: Number(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Amount Paid</label>
                  <input
                    type="number"
                    value={newBatchOrder.amountPaid}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      amountPaid: Number(e.target.value)
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Delivery Date</label>
                  <input
                    type="date"
                    value={newBatchOrder.deliveryDate}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      deliveryDate: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Ward</label>
                  <input
                    type="text"
                    value={newBatchOrder.ward}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      ward: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Village</label>
                  <input
                    type="text"
                    value={newBatchOrder.village}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      village: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Phone</label>
                  <input
                    type="text"
                    value={newBatchOrder.phone}
                    onChange={(e) => setNewBatchOrder(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Feed Orders */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Feed Orders</h3>
                  <button
                    type="button"
                    onClick={addFeedOrder}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#066b3a] hover:bg-[#044d29]"
                  >
                    Add Feed Order
                  </button>
                </div>

                <div className="space-y-4">
                  {newBatchOrder.feedOrders.map((feed, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Feed Type</label>
                          <select
                            value={feed.feedType}
                            onChange={(e) => updateFeedOrder(index, 'feedType', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                            required
                          >
                            <option value="BROILER_STARTER">Broiler Starter</option>
                            <option value="BROILER_GROWER">Broiler Grower</option>
                            <option value="BROILER_FINISHER">Broiler Finisher</option>
                            <option value="LAYER_STARTER">Layer Starter</option>
                            <option value="LAYER_GROWER">Layer Grower</option>
                            <option value="COMPLETE_LAYER_MASH">Complete Layer Mash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Company</label>
                          <select
                            value={feed.company}
                            onChange={(e) => updateFeedOrder(index, 'company', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                            required
                          >
                            <option value="SILVERLAND">Silverland</option>
                            <option value="ARVINES">Arvines</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Quantity</label>
                          <input
                            type="number"
                            value={feed.quantity}
                            onChange={(e) => updateFeedOrder(index, 'quantity', Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Price per Unit</label>
                          <input
                            type="number"
                            value={feed.pricePerUnit}
                            onChange={(e) => updateFeedOrder(index, 'pricePerUnit', Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#066b3a] focus:ring-[#066b3a] sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeedOrder(index)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Feed Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#066b3a] hover:bg-[#044d29]"
                >
                  Add Batch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 