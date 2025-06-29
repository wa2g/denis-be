"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order, getAuthToken } from "../page";

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      if (!user) throw new Error("No user found");
      const response = await fetch(`${process.env.BASE_URL}/orders/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pending orders");
      const data = await response.json();
      // Only show orders managed by the current user
      setOrders(data.filter((order: Order) => order.orderManagerId === user.id));
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (orderId: string, orderNumber: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${process.env.BASE_URL}/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "PENDING",
          reason: "Submitted by order manager",
        }),
      });
      if (!response.ok) throw new Error("Failed to submit order");
      fetchPendingOrders();
    } catch (error) {
      alert("Failed to submit order. Please try again.");
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Pending Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div>No pending orders found.</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Farm Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Region</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Items</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Total (TZS)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.companyName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.farmName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.region}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{order.items.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{parseFloat(order.totalAmount).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                  <button
                    onClick={() => handleSubmitOrder(order.id, order.orderNumber)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 