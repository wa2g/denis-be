'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface ChickenStock {
  id: string;
  chickenType: 'SASSO' | 'BROILER';
  currentQuantity: number;
  totalReceived: number;
  totalSold: number;
  minimumStock: number;
  createdAt: string;
  updatedAt: string;
  numberOfBoxes: number;
  chickensPerBox: number;
  pricePerBox: number;
  buyingPricePerChicken: number;
  sellingPricePerChicken: number;
  totalBoxValue: number;
}

export default function ChickenStockManagement() {
  const [stocks, setStocks] = useState<ChickenStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showMinimumStockModal, setShowMinimumStockModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'SASSO' | 'BROILER'>('SASSO');
  // const [quantity, setQuantity] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(0);
  const [lowStockItems, setLowStockItems] = useState<ChickenStock[]>([]);
  const [newStock, setNewStock] = useState({
    chickenType: 'SASSO' as 'SASSO' | 'BROILER',
    quantity: 0
  });
  const [showViewStockModal, setShowViewStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<ChickenStock | null>(null);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [editingPrices, setEditingPrices] = useState({
    pricePerBox: 0,
    chickensPerBox: 100,
    buyingPricePerChicken: 0,
    sellingPricePerChicken: 0
  });
  const [editingType, setEditingType] = useState<'SASSO' | 'BROILER'>('SASSO');

  const getAuthHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const fetchStocks = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }

      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      alert('Error loading stocks. Please try again.');
    }
  }, []);

  const fetchLowStocks = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock/check/low`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch low stocks');
      }

      const data = await response.json();
      setLowStockItems(data);
    } catch (error) {
      console.error('Error fetching low stocks:', error);
    }
  }, []);

  const fetchStockByType = async (chickenType: 'SASSO' | 'BROILER') => {
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock/${chickenType}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stock details');
      }

      const data = await response.json();
      setSelectedStock(data);
      setShowViewStockModal(true);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      alert('Error loading stock details. Please try again.');
    }
  };

  useEffect(() => {
    Promise.all([fetchStocks(), fetchLowStocks()]).finally(() => {
      setLoading(false);
    });
  }, [fetchStocks, fetchLowStocks]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock/add/${newStock.chickenType}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          chickenType: newStock.chickenType,
          quantity: newStock.quantity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add stock');
      }

      await Promise.all([fetchStocks(), fetchLowStocks()]);
      setShowAddStockModal(false);
      setNewStock({
        chickenType: 'SASSO',
        quantity: 0
      });
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Error adding stock. Please try again.');
    }
  };

  const handleSetMinimumStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock/minimum/${selectedType}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ minimumStock }),
      });

      if (!response.ok) {
        throw new Error('Failed to set minimum stock');
      }

      await Promise.all([fetchStocks(), fetchLowStocks()]);
      setShowMinimumStockModal(false);
      setMinimumStock(0);
    } catch (error) {
      console.error('Error setting minimum stock:', error);
      alert('Error setting minimum stock. Please try again.');
    }
  };

  const handleEditPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.BASE_URL}/chicken-stock/pricing/${editingType}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingPrices),
      });

      if (!response.ok) {
        throw new Error('Failed to update prices');
      }

      await fetchStocks();
      setShowEditPriceModal(false);
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Error updating prices. Please try again.');
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#066b3a]">Chicken Stock Management</h1>
        <p className="text-gray-600">Manage your chicken inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stocks.map((stock) => (
          <div key={stock.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{stock.chickenType}</p>
                <p className="text-xl font-bold text-gray-900">{stock.currentQuantity.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Current Stock</p>
              </div>
              {stock.currentQuantity <= stock.minimumStock && (
                <ExclamationTriangleIcon className="h-8 w-8 text-red-900" />
              )}
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <div className="flex items-center text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {stock.totalReceived.toLocaleString()} Received
              </div>
              <div className="flex items-center text-red-600">
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                {stock.totalSold.toLocaleString()} Sold
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddStockModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
        >
          <PlusIcon className="w-5 h-5" />
          Add Stock
        </button>
        <button
          onClick={() => setShowMinimumStockModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#066b3a] text-[#066b3a] rounded hover:bg-[#066b3a] hover:text-white"
        >
          Set Minimum Stock
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-red-800 mb-2 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Low Stock Alert
          </h2>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm text-red-700">
                <span>{item.chickenType}</span>
                <span>Current: {item.currentQuantity} (Min: {item.minimumStock})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Current Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Total Received</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Total Sold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Number of Boxes</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Chickens/Box</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Price/Box</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Buying Price/Chicken</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Selling Price/Chicken</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Total Box Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Minimum Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Last Updated</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stock.chickenType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {stock.currentQuantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  {stock.totalReceived.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  {stock.totalSold.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {stock.numberOfBoxes.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {stock.chickensPerBox.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {Number(stock.pricePerBox).toLocaleString()} TZS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {Number(stock.buyingPricePerChicken).toLocaleString()} TZS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {Number(stock.sellingPricePerChicken).toLocaleString()} TZS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {Number(stock.totalBoxValue).toLocaleString()} TZS
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {stock.minimumStock.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    stock.currentQuantity <= stock.minimumStock
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {stock.currentQuantity <= stock.minimumStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(stock.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => fetchStockByType(stock.chickenType)}
                      className="text-[#066b3a] hover:text-[#055830] inline-flex items-center"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingType(stock.chickenType);
                        setEditingPrices({
                          pricePerBox: stock.pricePerBox,
                          chickensPerBox: stock.chickensPerBox,
                          buyingPricePerChicken: stock.buyingPricePerChicken,
                          sellingPricePerChicken: stock.sellingPricePerChicken
                        });
                        setShowEditPriceModal(true);
                      }}
                      className="text-[#066b3a] hover:text-[#055830] inline-flex items-center"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-32 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add Stock</h3>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Chicken Type</label>
                  <select
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900"
                    value={newStock.chickenType}
                    onChange={(e) => setNewStock({ ...newStock, chickenType: e.target.value as 'SASSO' | 'BROILER' })}
                    required
                  >
                    <option value="SASSO">SASSO</option>
                    <option value="BROILER">BROILER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Quantity</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900"
                    value={newStock.quantity}
                    onChange={(e) => setNewStock({ ...newStock, quantity: parseInt(e.target.value) })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="px-4 py-2 border rounded text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Minimum Stock Modal */}
      {showMinimumStockModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-32 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Set Minimum Stock</h3>
              <button
                onClick={() => setShowMinimumStockModal(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSetMinimumStock}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Chicken Type</label>
                  <select
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'SASSO' | 'BROILER')}
                    required
                  >
                    <option value="SASSO">SASSO</option>
                    <option value="BROILER">BROILER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Minimum Stock Level</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2 text-gray-900"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(parseInt(e.target.value))}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowMinimumStockModal(false)}
                  className="px-4 py-2 border rounded text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded hover:bg-[#055830]"
                >
                  Set Minimum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Stock Details Modal */}
      {showViewStockModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-[900px] shadow-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Stock Details - {selectedStock.chickenType}
              </h3>
              <button
                onClick={() => {
                  setShowViewStockModal(false);
                  setSelectedStock(null);
                }}
                className="text-gray-400 hover:text-gray-900 p-1"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-base font-medium text-gray-900 mb-4">Stock Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedStock.currentQuantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Received:</span>
                    <span className="text-sm font-medium text-green-600">{selectedStock.totalReceived.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Sold:</span>
                    <span className="text-sm font-medium text-red-600">{selectedStock.totalSold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Minimum Stock Level:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedStock.minimumStock.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-base font-medium text-gray-900 mb-4">Box Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Number of Boxes:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedStock.numberOfBoxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chickens per Box:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedStock.chickensPerBox.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price per Box:</span>
                    <span className="text-sm font-medium text-gray-900">{Number(selectedStock.pricePerBox).toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Box Value:</span>
                    <span className="text-sm font-medium text-gray-900">{Number(selectedStock.totalBoxValue).toLocaleString()} TZS</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-base font-medium text-gray-900 mb-4">Pricing Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Buying Price per Chicken:</span>
                    <span className="text-sm font-medium text-gray-900">{Number(selectedStock.buyingPricePerChicken).toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Selling Price per Chicken:</span>
                    <span className="text-sm font-medium text-gray-900">{Number(selectedStock.sellingPricePerChicken).toLocaleString()} TZS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit per Chicken:</span>
                    <span className="text-sm font-medium text-green-600">
                      {(selectedStock.sellingPricePerChicken - selectedStock.buyingPricePerChicken).toLocaleString()} TZS
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h4 className="text-base font-medium text-gray-900 mb-4">Status Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stock Status:</span>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      selectedStock.currentQuantity <= selectedStock.minimumStock
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedStock.currentQuantity <= selectedStock.minimumStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedStock.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setShowViewStockModal(false);
                  setSelectedStock(null);
                }}
                className="px-6 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditPriceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-[900px] shadow-2xl rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Prices - {editingType}
              </h3>
              <button
                onClick={() => setShowEditPriceModal(false)}
                className="text-gray-400 hover:text-gray-900 p-1"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <form onSubmit={handleEditPrice}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Price Per Box (TZS)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-gray-900"
                    value={editingPrices.pricePerBox || 0}
                    onChange={(e) => setEditingPrices({ ...editingPrices, pricePerBox: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Chickens Per Box</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-gray-900"
                    value={editingPrices.chickensPerBox || 100}
                    onChange={(e) => setEditingPrices({ ...editingPrices, chickensPerBox: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Buying Price Per Chicken (TZS)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-gray-900"
                    value={editingPrices.buyingPricePerChicken || 0}
                    onChange={(e) => setEditingPrices({ ...editingPrices, buyingPricePerChicken: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 ">Selling Price Per Chicken (TZS)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border rounded-md shadow-sm p-2.5 text-gray-900"
                    value={editingPrices.sellingPricePerChicken || 0}
                    onChange={(e) => setEditingPrices({ ...editingPrices, sellingPricePerChicken: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditPriceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#066b3a] text-white rounded-lg hover:bg-[#055830] font-medium"
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