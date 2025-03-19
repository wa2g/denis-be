'use client';
import { useState } from 'react';
import Image from 'next/image';

interface OrderRequestFormProps {
  onSubmit: (data: OrderRequestData) => void;
  onCancel: () => void;
}

interface OrderRequestData {
  orderNumber: string;
  date: string;
  to: {
    company: string;
    farm: string;
    farmNumber: string;
    village: string;
    district: string;
    address: string;
  };
  contactPerson: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  qty: number;
  description: string;
  unitPrice: number;
  total: number;
}

export default function OrderRequestForm({ onSubmit, onCancel }: OrderRequestFormProps) {
  const [formData, setFormData] = useState<OrderRequestData>({
    orderNumber: generateOrderNumber(),
    date: new Date().toISOString().split('T')[0],
    to: {
      company: '',
      farm: '',
      farmNumber: '',
      village: '',
      district: '',
      address: '',
    },
    contactPerson: {
      name: '',
      phone: '',
    },
    items: [{ qty: 0, description: '', unitPrice: 0, total: 0 }],
  });

  function generateOrderNumber() {
    const year = new Date().getFullYear();
    const number = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${year}-${number}`;
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { qty: 0, description: '', unitPrice: 0, total: 0 }],
    }));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: number | string) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'qty' || field === 'unitPrice' 
        ? (field === 'qty' ? Number(value) : newItems[index].qty) * (field === 'unitPrice' ? Number(value) : newItems[index].unitPrice)
        : newItems[index].total,
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/logos/logo-spade.png"
            alt="SpaDe Logo"
            width={60}
            height={60}
            className="rounded"
          />
          <div>
            <h1 className="text-xl font-bold text-black">Spade Co. Ltd</h1>
            <p className="text-sm text-gray-600">1B Tanganyika - Maichagange Street</p>
            <p className="text-sm text-gray-600">+255 (0)653461126/+255(0)754574743</p>
            <div className="text-sm text-gray-600">
              <a href="mailto:info@spade.co.tz" className="text-[#066b3a]">info@spade.co.tz</a>,{' '}
              <a href="https://www.spade.co.tz" className="text-[#066b3a]">www.spade.co.tz</a>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-[#0175bb]">REQUEST ORDER</h2>
          <p className="text-sm font-medium text-black">ORDER #: {formData.orderNumber}</p>
          <p className="text-sm font-medium text-black">Date: {formData.date}</p>
        </div>
      </div>

      {/* To Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-black mb-2">To:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Enter company name"
              className="w-full p-2 border rounded text-black placeholder:text-gray-300"
              value={formData.to.company}
              onChange={e => setFormData(prev => ({
                ...prev,
                to: { ...prev.to, company: e.target.value }
              }))}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter farm name"
              className="w-full p-2 border rounded text-black placeholder:text-gray-300"
              value={formData.to.farm}
              onChange={e => setFormData(prev => ({
                ...prev,
                to: { ...prev.to, farm: e.target.value }
              }))}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter farm number"
              className="w-full p-2 border rounded text-black placeholder:text-gray-300"
              value={formData.to.farmNumber}
              onChange={e => setFormData(prev => ({
                ...prev,
                to: { ...prev.to, farmNumber: e.target.value }
              }))}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter village"
              className="w-full p-2 border rounded text-black placeholder:text-gray-300"
              value={formData.to.village}
              onChange={e => setFormData(prev => ({
                ...prev,
                to: { ...prev.to, village: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      {/* Contact Person */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-black mb-2">Contact Person:</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Enter contact name"
            className="w-full p-2 border rounded text-black placeholder:text-gray-300"
            value={formData.contactPerson.name}
            onChange={e => setFormData(prev => ({
              ...prev,
              contactPerson: { ...prev.contactPerson, name: e.target.value }
            }))}
          />
          <input
            type="text"
            placeholder="Enter phone number"
            className="w-full p-2 border rounded text-black placeholder:text-gray-300"
            value={formData.contactPerson.phone}
            onChange={e => setFormData(prev => ({
              ...prev,
              contactPerson: { ...prev.contactPerson, phone: e.target.value }
            }))}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full mb-4">
          <thead className="bg-[#0175bb] text-white">
            <tr>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Unit price (TZS)</th>
              <th className="p-2 text-right">Total (TZS)</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-20 p-1 border rounded text-black placeholder:text-gray-300"
                    value={item.qty}
                    onChange={e => updateItem(index, 'qty', Number(e.target.value))}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Enter description"
                    className="w-full p-1 border rounded text-black placeholder:text-gray-300"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-32 p-1 border rounded text-right text-black placeholder:text-gray-300"
                    value={item.unitPrice}
                    onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                  />
                </td>
                <td className="p-2 text-right text-black font-medium">
                  {item.total === 0 ? '0' : item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-2 text-right text-xl font-bold text-black">Total (TZS)</td>
              <td className="p-2 text-right text-xl font-bold text-black">{calculateTotal().toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <button
          onClick={addItem}
          className="bg-[#066b3a] text-white px-4 py-2 rounded hover:bg-[#055830]"
        >
          Add Item
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(formData)}
          className="px-6 py-2 bg-[#0175bb] text-white rounded hover:bg-[#015d95]"
        >
          Submit Order
        </button>
      </div>
    </div>
  );
} 