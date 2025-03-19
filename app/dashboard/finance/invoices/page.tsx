'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import InvoicePrintTemplate from '../../../components/InvoicePrintTemplate';
import { 
  DocumentTextIcon,
  PrinterIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  type: string;
  items: {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description: string;
  }[];
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  notes: string | null;
  requestId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  request?: {
    id: string;
    requestNumber: string;
    requestDate: string;
    taskType: string;
    employeeName: string;
    employeeTitle: string;
    employeeAddress: string;
    employeePhone: string;
    items: {
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      description: string;
    }[];
    total: string;
    status: string;
    spadeEmployee: string;
  } | null;
  order?: {
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
    createdAt: string;
    updatedAt: string;
    orderNumber: string;
    date: string;
    region: string;
    pobox: string;
    approvedBy: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Move getAuthToken outside component
const getAuthToken = () => {
  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='));
  return userCookie ? userCookie.split('=')[1] : null;
};

export default function InvoicesPage() {
  // Helper function to check if status is an approval status
  const isApprovedStatus = useCallback((status: string) => {
    return status === 'MANAGER_APPROVED' || status === 'CEO_APPROVED';
  }, []);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  const fetchInvoices = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/invoices/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserRole(user.role);
    }
    fetchInvoices();
  }, [fetchInvoices]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'PENDING').length,
    approved: invoices.filter(i => isApprovedStatus(i.status)).length,
    rejected: invoices.filter(i => i.status === 'REJECTED').length,
    totalValue: invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total), 0),
  }), [invoices, isApprovedStatus]);

  // Filter invoices based on selected status
  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    if (statusFilter === 'APPROVED') {
      return invoices.filter(invoice => isApprovedStatus(invoice.status));
    }
    return invoices.filter(invoice => invoice.status === statusFilter);
  }, [invoices, statusFilter, isApprovedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MANAGER_APPROVED':
      case 'CEO_APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Prepare invoice data for the template
    const printInvoice = {
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: invoice.request?.requestNumber || invoice.order?.orderNumber || '',
      date: new Date(invoice.invoiceDate).toLocaleDateString(),
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      customer: invoice.request ? {
        name: invoice.request.employeeName,
        location: invoice.request.employeeAddress || '',
        email: '',
        farmName: '',
        farmNumber: '',
        contactName: invoice.request.employeeName,
        phoneNumber: invoice.request.employeePhone,
        pobox: '',
      } : {
        name: invoice.order?.companyName || '',
        location: `${invoice.order?.villageName || ''}, ${invoice.order?.region || ''}`,
        email: invoice.order?.approvedBy?.email || '',
        farmName: invoice.order?.farmName || '',
        farmNumber: invoice.order?.farmNumber || '',
        contactName: invoice.order?.contactName || '',
        phoneNumber: invoice.order?.phoneNumber || '',
        pobox: invoice.order?.pobox || '',
      },
      items: invoice.items.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: Number(invoice.subtotal),
      vat: Number(invoice.tax),
      total: Number(invoice.total),
      type: invoice.type,
      approvedBy: invoice.request ? invoice.request.spadeEmployee : (invoice.order?.approvedBy?.name || ''),
      approvedDate: new Date(invoice.updatedAt).toLocaleDateString(),
      generatedBy: invoice.createdBy.name,
    };

    // Write the invoice HTML to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${ReactDOMServer.renderToString(<InvoicePrintTemplate invoice={printInvoice} />)}
        </body>
      </html>
    `);

    // Print the window
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Add approve/cancel handlers
  const handleApproveInvoice = async (invoiceId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Set the appropriate status based on user role and current status
      const approvalStatus = userRole === 'CEO' ? 'APPROVED' : 'MANAGER_APPROVED';

      const response = await fetch(`${process.env.BASE_URL}/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalStatus,
          reason: `Approved by ${userRole}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve invoice');
      }

      // Refresh invoices after approval
      fetchInvoices();
    } catch (error) {
      console.error('Error approving invoice:', error);
      alert('Failed to approve invoice. Please try again.');
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          reason: `Cancelled by ${userRole}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel invoice');
      }

      // Refresh invoices after cancellation
      fetchInvoices();
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Invoices</h1>
        <p className="text-black mt-2">Track and manage all generated invoices</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Invoices</p>
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
              <p className="text-black text-sm">Approved</p>
              <p className="text-2xl font-bold text-black">{stats.approved}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-black text-sm">Total Value</p>
              <p className="text-2xl font-bold text-black">{stats.totalValue.toLocaleString()} TZS</p>
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
            <option value="all">All Invoices</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">All Approved</option>
            <option value="MANAGER_APPROVED">Manager Approved</option>
            <option value="CEO_APPROVED">CEO Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No invoices found</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Reference #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Customer/Employee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase">Amount (TZS)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Generated By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {invoice.request?.requestNumber || invoice.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {invoice.request?.employeeName || invoice.order?.companyName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-right">
                      {parseFloat(invoice.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {invoice.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {invoice.createdBy.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <PrinterIcon className="w-4 h-4 mr-1" />
                          Print
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceModal(true);
                          }}
                          className="inline-flex items-center text-green-600 hover:text-green-800"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                        
                        {/* Show approve/cancel buttons based on role and status */}
                        {((userRole === 'MANAGER' && invoice.status === 'PENDING') || 
                          (userRole === 'CEO' && invoice.status === 'MANAGER_APPROVED')) && (
                          <>
                            <button
                              onClick={() => handleApproveInvoice(invoice.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleCancelInvoice(invoice.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </>
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

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <InvoicePrintTemplate
              invoice={{
                invoiceNumber: selectedInvoice.invoiceNumber,
                orderNumber: selectedInvoice.order?.orderNumber || '',
                date: new Date(selectedInvoice.createdAt).toLocaleDateString(),
                dueDate: new Date(new Date(selectedInvoice.createdAt).getTime() + 30*24*60*60*1000).toLocaleDateString(),
                customer: {
                  name: selectedInvoice.order?.companyName || '',
                  location: `${selectedInvoice.order?.villageName}, ${selectedInvoice.order?.region}`,
                  email: selectedInvoice.order?.approvedBy?.email || '',
                  farmName: selectedInvoice.order?.farmName || '',
                  farmNumber: selectedInvoice.order?.farmNumber || '',
                  contactName: selectedInvoice.order?.contactName || '',
                  phoneNumber: selectedInvoice.order?.phoneNumber || '',
                  pobox: selectedInvoice.order?.pobox || '',
                },
                items: selectedInvoice.items.map(item => ({
                  name: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                })),
                subtotal: Number(selectedInvoice.subtotal),
                vat: Number(selectedInvoice.tax),
                total: Number(selectedInvoice.total),
                type: selectedInvoice.type,
                approvedBy: selectedInvoice.order?.approvedBy?.name || '',
                approvedDate: new Date(selectedInvoice.updatedAt).toLocaleDateString(),
                generatedBy: selectedInvoice.createdBy.name,
              }}
            />
            <div className="print:hidden p-4 flex justify-end border-t">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
              >
                Close
              </button>
              <button
                onClick={() => handlePrintInvoice(selectedInvoice)}
                className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830] flex items-center gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 