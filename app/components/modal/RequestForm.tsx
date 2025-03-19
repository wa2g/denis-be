'use client';
import { useState } from 'react';
import Image from 'next/image';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface RequestItem {
  itemNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface RequestFormData {
  taskType: string;
  employeeName: string;
  employeeTitle: string;
  employeeAddress: string;
  employeePhone: string;
  items: RequestItem[];
  spadeEmployee: string;
  requestNumber: string;
  requestDate: string;
}

interface RequestFormProps {
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
}

export default function RequestForm({ onSubmit, onCancel }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    taskType: 'Services',
    employeeName: '',
    employeeTitle: '',
    employeeAddress: '',
    employeePhone: '',
    items: [],
    spadeEmployee: '',
    requestNumber: `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    requestDate: new Date().toLocaleDateString()
  });

  const addItem = () => {
    const newItem: RequestItem = {
      itemNumber: formData.items.length + 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const updateItem = (
    index: number,
    field: keyof RequestItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    const updatedItem = { ...newItems[index] };

    if (field === 'description') {
      updatedItem.description = String(value);
    } else if (field === 'quantity' || field === 'unitPrice' || field === 'itemNumber' || field === 'totalPrice') {
      updatedItem[field] = Number(value);
    }

    // Update total price if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
    }

    newItems[index] = updatedItem;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    // Renumber remaining items
    newItems.forEach((item, i) => {
      item.itemNumber = i + 1;
    });
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-[#f0f7ff] p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logos/logo-spade.png"
              alt="SpaDe Logo"
              width={120}
              height={120}
              className="rounded"
            />
            <div>
              <p className="text-sm text-black">Plot 1B,Tanganyika-Maichagange Street</p>
              <p className="text-sm text-black">Mbweni - Mpiji</p>
              <p className="text-sm text-black">Kinondoni - DSM</p>
              <p className="text-sm text-black">+255 (0) 653 461 126</p>
              <div className="text-sm text-black">
                <span>info@spade.co.tz</span> <span>www.spade.co.tz</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-2 text-[#0175bb]">REQUEST FORM</h2>
            <p className="text-sm text-black">Request #: {formData.requestNumber}</p>
            <p className="text-sm text-black">Request date: {formData.requestDate}</p>
            <p className="text-sm text-black">Task: {formData.taskType}</p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Employee Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-black"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Title:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-black"
                value={formData.employeeTitle}
                onChange={(e) => setFormData({ ...formData, employeeTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Address:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-black"
                value={formData.employeeAddress}
                onChange={(e) => setFormData({ ...formData, employeeAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-black">Phone:</label>
              <input
                type="text"
                className="w-full p-2 border rounded text-black"
                value={formData.employeePhone}
                onChange={(e) => setFormData({ ...formData, employeePhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <PlusIcon className="w-5 h-5" />
              Add Item
            </button>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.itemNumber}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="w-full border rounded p-1"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      className="w-20 border rounded p-1 text-right"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      className="w-32 border rounded p-1 text-right"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      min="0"
                      required
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.totalPrice.toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {formData.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No items added. Click &quot;Add Item&quot; to add items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="font-medium mb-2 text-black">SpaDe Employee</p>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full max-w-xs p-2 border rounded text-black"
            value={formData.spadeEmployee}
            onChange={(e) => setFormData({ ...formData, spadeEmployee: e.target.value })}
          />
          <p className="text-sm italic text-black">We Work With Integrity & Responsibility</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
            disabled={formData.items.length === 0}
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
} 