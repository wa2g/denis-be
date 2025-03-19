'use client';

import { useState } from 'react';
import { Product } from '@/app/types/products';

interface AddProductFormProps {
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

export default function AddProductForm({ onSubmit, onCancel }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 0,
    unity: '',
    buyingPrice: 0,
    sellingPrice: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product: Product = {
      id: Date.now(), // Temporary ID, should be replaced by server
      productName: formData.productName,
      quantity: formData.quantity,
      unity: formData.unity,
      buyingPrice: formData.buyingPrice,
      sellingPrice: formData.sellingPrice,
      remainingQty: formData.quantity,
      totalSalesCash: 0,
      totalSalesLoan: 0,
      totalSoldQtyCash: 0,
      totalSoldQtyLoan: 0
    };

    onSubmit(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Product Name
        </label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          className="w-full p-2 border rounded text-black"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            className="w-full p-2 border rounded text-black"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Unity
          </label>
          <input
            type="text"
            value={formData.unity}
            onChange={(e) => setFormData({ ...formData, unity: e.target.value })}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Buying Price (TZS)
          </label>
          <input
            type="number"
            value={formData.buyingPrice}
            onChange={(e) => setFormData({ ...formData, buyingPrice: Number(e.target.value) })}
            className="w-full p-2 border rounded text-black"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Selling Price (TZS)
          </label>
          <input
            type="number"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
            className="w-full p-2 border rounded text-black"
            required
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
        >
          Add Product
        </button>
      </div>
    </form>
  );
} 