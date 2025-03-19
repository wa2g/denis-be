'use client';

import { useState } from 'react';
// import * as XLSX from 'xlsx';
import { Product } from '../types/products';
import Cookies from 'js-cookie';

interface ExcelUploaderProps {
  onUpload: (products: Product[]) => void;
}

export default function ExcelUploader({ onUpload }: ExcelUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = Cookies.get('token');
      const response = await fetch('${process.env.BASE_URL}/products/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const products: Product[] = await response.json();
      onUpload(products);
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      alert('Error uploading Excel file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
        id="excel-upload"
        disabled={loading}
      />
      <label
        htmlFor="excel-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="text-sm text-gray-600">
          {loading ? 'Uploading...' : 'Click to upload Excel file'}
        </span>
      </label>
    </div>
  );
} 