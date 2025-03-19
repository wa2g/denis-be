'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/app/types/products';
import { Customer } from '@/app/types/sales';
import { useRouter } from 'next/navigation';
import {
  TrashIcon,
  PlusIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface SaleItem {
  productId: string;
  product: Product;
  quantity: number;
}

export default function NewSale() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [paymentType, setPaymentType] = useState<'CASH' | 'LOAN'>('CASH');
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/customers`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Error loading customers. Please try again.');
    }
  }, [router]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/products`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error loading products. Please try again.');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCustomers()]).then(() => {
      setLoading(false);
    });
  }, [fetchProducts, fetchCustomers]);

  const addItem = () => {
    if (products.length === 0) return;
    const product = products[0];
    setItems([
      ...items,
      {
        productId: String(product.id),
        product,
        quantity: 1,
      },
    ]);
  };

  const updateItem = (index: number, field: 'productId' | 'quantity', value: number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const product = products.find((p) => String(p.id) === String(value));
      if (!product) return;
      item.product = product;
      item.productId = String(product.id);
    } else {
      item.quantity = value;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/sales`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerId: selectedCustomerId,
          paymentType,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create sale');
      }

      const sale = await response.json();
      router.push(`/dashboard/sales/${sale.id}`);
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error creating sale. Please try again.');
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
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#066b3a]">New Sale</h1>
          <p className="text-gray-900">Create a new sale record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Select Customer
                </label>
                <select
                  className="w-full p-2 border rounded text-gray-900"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.village}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Payment Type
                </label>
                <select
                  className="w-full p-2 border rounded text-gray-900"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'CASH' | 'LOAN')}
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="LOAN">Loan</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                <PlusIcon className="w-5 h-5" />
                Add Item
              </button>
            </div>

            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">
                      <select
                        className="w-full p-2 border rounded"
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                        required
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-24 p-2 border rounded text-right"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                        required
                      />
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-900">
                      No items added. Click Add Item to add products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
            disabled={items.length === 0 || !selectedCustomerId}
          >
            Create Sale
          </button>
        </div>
      </form>
    </div>
  );
} 