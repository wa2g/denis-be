'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import productsData from '@/data/products.json';
import { handleUnauthorizedResponse } from '@/app/utils';

interface Product {
  description: string;
  unitPrice: number;
}

interface OrderItem {
  quantity: string;
  description: string;
  unitPrice: string;
  totalPrice: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to generate order number
  const generateOrderNumber = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `ORD-${year}${month}${day}-${random}`;
  };

  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    orderNumber: generateOrderNumber(),
    company: '',
    farmName: '',
    farmNumber: '',
    streetVillage: '',
    region: '',
    poBox: '',
    contactName: '',
    phoneNumber: '',
    items: [
      {
        quantity: '',
        description: '',
        unitPrice: '',
        totalPrice: '',
      },
    ],
  });

  useEffect(() => {
    // Sort products alphabetically by description
    const sortedProducts = [...productsData.products].sort((a, b) => 
      a.description.localeCompare(b.description)
    );
    setProducts(sortedProducts);
    setLoading(false);
  }, []);

  const calculateItemTotal = (quantity: string, unitPrice: string) => {
    return (Number(quantity) * Number(unitPrice)).toString();
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // If description changes, update the unit price
    if (field === 'description') {
      const product = products.find(p => p.description === value);
      if (product) {
        newItems[index].unitPrice = product.unitPrice.toString();
        // Update total price with new unit price
        newItems[index].totalPrice = calculateItemTotal(
          newItems[index].quantity,
          product.unitPrice.toString()
        );
      }
    }

    // Update total price if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = calculateItemTotal(
        field === 'quantity' ? value : newItems[index].quantity,
        field === 'unitPrice' ? value : newItems[index].unitPrice
      );
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          quantity: '',
          description: '',
          unitPrice: '',
          totalPrice: '',
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return; // Keep at least one item
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Add this function to format phone number
  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number starts with 0, replace it with +255
    if (cleaned.startsWith('0')) {
      cleaned = '255' + cleaned.substring(1);
    }
    
    // If number doesn't have country code, add it
    if (!cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Format the items data
      const formattedItems = formData.items.map(item => ({
        quantity: parseInt(item.quantity),
        description: item.description,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice)
      }));

      // Calculate total amount
      const totalAmount = formattedItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Format phone number
      const formattedPhone = formatPhoneNumber(formData.phoneNumber);

      const orderData = {
        orderNumber: formData.orderNumber,
        date: formData.orderDate,
        companyName: formData.company,
        farmName: formData.farmName,
        farmNumber: formData.farmNumber,
        villageName: formData.streetVillage,
        region: formData.region,
        pobox: formData.poBox,
        contactName: formData.contactName,
        phoneNumber: formattedPhone,
        items: formattedItems,
        totalAmount: totalAmount,
        status: 'Pending'
      };

      console.log('Sending order data:', orderData); // Debug log

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (handleUnauthorizedResponse(response)) return;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      router.push('/dashboard/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0175bb]">Create New Order</h1>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Orders
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="text-gray-900">
            <p>Order Number: {formData.orderNumber}</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Order Info Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-gray-900 text-lg font-semibold mb-4">Order Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Order Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.orderNumber}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Date
                    </label>
                    <input
                      type="date"
                      readOnly
                      value={formData.orderDate}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-gray-900 text-lg font-semibold mb-4">Address Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Farm Number
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900  "
                      value={formData.farmNumber}
                      onChange={(e) => setFormData({ ...formData, farmNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Street/Village
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900  "
                      value={formData.streetVillage}
                      onChange={(e) => setFormData({ ...formData, streetVillage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Region
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900    "
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      P.O. Box
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900      "
                      value={formData.poBox}
                      onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-gray-900 text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900      "
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0712345678 or +255712345678"
                      pattern="[0-9+]{10,}"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        // Allow only numbers and + symbol
                        const value = e.target.value.replace(/[^\d+]/g, '');
                        setFormData({ ...formData, phoneNumber: value });
                      }}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter number with country code (+255) or starting with 0
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-gray-900 text-lg font-semibold">Order Details</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-[#0175bb] text-white px-3 py-1 rounded-md hover:bg-[#0175bb]/90 flex items-center gap-1"
                  >
                    <span>Add Item</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium text-gray-900">Item {index + 1}</h3>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">
                          Quantity
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <select
                          required
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        >
                          <option value="">Select a product</option>
                          {products.map((product) => (
                            <option key={`${product.description}-${product.unitPrice}`} value={product.description}>
                              {product.description}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          readOnly
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                          value={item.unitPrice}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">
                          Total
                        </label>
                        <input
                          type="number"
                          readOnly
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-900"
                          value={item.totalPrice}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Total Amount: TZS{calculateTotalAmount().toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-[#0175bb] text-white px-4 py-2 rounded-md hover:bg-[#0175bb]/90"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="border border-red-300 px-4 py-2 rounded-md hover:bg-red-50 text-red-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 