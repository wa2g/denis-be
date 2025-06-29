"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Order, getAuthToken } from "../page";

export default function SubmitOrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orderNumber = params?.orderNumber as string;

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");
        const response = await fetch(`${process.env.BASE_URL}/orders/${orderNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderNumber) fetchOrder();
  }, [orderNumber]);

  const handleSubmit = async () => {
    setSubmitting(true);
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
      router.push("/dashboard/orders/pending");
    } catch (error) {
      alert("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8">Order not found.</div>;

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Submit Order</h1>
      <div className="mb-4">
        <div><strong>Order #:</strong> {order.orderNumber}</div>
        <div><strong>Company:</strong> {order.companyName}</div>
        <div><strong>Farm Name:</strong> {order.farmName}</div>
        <div><strong>Region:</strong> {order.region}</div>
        <div><strong>Total:</strong> {parseFloat(order.totalAmount).toLocaleString()} TZS</div>
      </div>
      <div className="mb-6 text-gray-700">Are you sure you want to submit this order for approval?</div>
      <div className="flex gap-2">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
} 