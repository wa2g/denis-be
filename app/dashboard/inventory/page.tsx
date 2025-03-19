'use client';

import { useState, useEffect, useCallback } from 'react';
import ExcelUploader from '../../components/ExcelUploader';
import { Product } from '../../types/products';
import {
  PlusIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    id: 0,
    productName: '',
    quantity: 0,
    unity: '',
    buyingPrice: '0',
    sellingPrice: '0',
  });

  const getAuthHeaders = () => {
    const token = Cookies.get('token'); // Get the token from cookies
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.BASE_URL}/products`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        // Handle unauthorized error - redirect to login
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      alert('Error loading inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial inventory data
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleExcelUpload = async (products: Product[]) => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/products/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(products),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to upload products');
      }

      await fetchInventory();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading products:', error);
      alert('Error uploading products. Please try again.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productName: newProduct.productName,
          quantity: newProduct.quantity,
          unity: newProduct.unity,
          buyingPrice: Number(newProduct.buyingPrice),
          sellingPrice: Number(newProduct.sellingPrice)
        }),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      await fetchInventory();
      setShowAddModal(false);
      setNewProduct({
        id: 0,
        productName: '',
        quantity: 0,
        unity: '',
        buyingPrice: '0',
        sellingPrice: '0',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await fetch(`${process.env.BASE_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          quantity: editingProduct.quantity,
          buyingPrice: Number(editingProduct.buyingPrice),
          sellingPrice: Number(editingProduct.sellingPrice)
        }),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      await fetchInventory();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
    }
  };

  // Add sorting and pagination logic
  const sortedInventory = [...inventory].sort((a, b) => a.id - b.id);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventory.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#066b3a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Track and manage your stock levels</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
        >
          <DocumentArrowUpIcon className="w-5 h-5" />
          Upload Excel
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#066b3a] text-[#066b3a] rounded hover:bg-gray-50"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </button>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">Total Products</h3>
          <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {inventory.filter(item => (item.remainingQty ?? 0) < 10).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">Total Sales (Cash)</h3>
          <p className="text-2xl font-bold text-green-600">
            {inventory.reduce((sum, item) => sum + Number(item.totalSalesCash), 0).toLocaleString()} TZS
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-1">Total Sales (Loan)</h3>
          <p className="text-2xl font-bold text-blue-600">
            {inventory.reduce((sum, item) => sum + Number(item.totalSalesLoan), 0).toLocaleString()} TZS
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Buying Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales (Cash)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales (Loan)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id}>
                  {/* <td className="px-6 py-4 whitespace-nowrap"> */}
                    {/* <div> */}
                      {/* <div className="text-sm font-medium text-gray-900">{item.id}</div> */}
                      {/* <div className="text-sm text-gray-500">{item.unity}</div> */}
                    {/* </div> */}
                  {/* </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      {/* <div className="text-sm text-gray-500">{item.unity}</div> */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{item.remainingQty}</div>
                    {/* <div className="text-xs text-gray-500">Total: {item.quantity}</div> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {Number(item.buyingPrice).toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {Number(item.sellingPrice).toLocaleString()} TZS
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{Number(item.totalSalesCash).toLocaleString()} TZS</div>
                    <div className="text-xs text-gray-500">Qty: {item.totalSoldQtyCash}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{Number(item.totalSalesLoan).toLocaleString()} TZS</div>
                    <div className="text-xs text-gray-500">Qty: {item.totalSoldQtyLoan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (item.remainingQty ?? 0) > 10
                        ? 'bg-green-100 text-green-800'
                        : (item.remainingQty ?? 0) > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(item.remainingQty ?? 0) > 10 ? 'In Stock' : (item.remainingQty ?? 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => {
                        setEditingProduct(item);
                        setShowEditModal(true);
                      }}
                      className="text-[#066b3a] hover:text-[#055830] mr-2"
                    >
                      Edit Product
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-4 mb-6 flex justify-between items-center px-4">
          <div className="text-sm text-gray-900">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, inventory.length)} of {inventory.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium text-gray-900"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === index + 1
                    ? 'bg-[#066b3a] text-white'
                    : 'hover:bg-gray-50'
                } text-sm font-medium`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium text-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
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
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
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
                    value={newProduct.unity}
                    onChange={(e) => setNewProduct({ ...newProduct, unity: e.target.value })}
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
                    value={newProduct.buyingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, buyingPrice: e.target.value })}
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
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    className="w-full p-2 border rounded text-black"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Inventory</h3>
            <ExcelUploader onUpload={handleExcelUpload} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-900 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product: {editingProduct.productName}</h3>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={editingProduct.quantity}
                  onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                  className="w-full p-2 border rounded text-black"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Buying Price (TZS)
                </label>
                <input
                  type="number"
                  value={editingProduct.buyingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, buyingPrice: Number(e.target.value) })}
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
                  value={editingProduct.sellingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                  className="w-full p-2 border rounded text-black"
                  required
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 