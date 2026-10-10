"use client";

import { useState } from "react";
import Link from "next/link";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import {
  getOrderByNumber,
  type Order,
  type OrderItem,
} from "@/lib/queries/orders";

const STATUS_STEPS = [
  { value: "pending", label: "Pending", icon: "clock" },
  { value: "confirmed", label: "Confirmed", icon: "check" },
  { value: "processing", label: "Processing", icon: "box" },
  { value: "shipped", label: "Shipped", icon: "truck" },
  { value: "delivered", label: "Delivered", icon: "check-circle" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  clock: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  box: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  truck: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  ),
  "check-circle": (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearched(false);
    setLoading(true);

    try {
      const { order: o, items: it } = await getOrderByNumber(
        orderNumber.trim().toUpperCase(),
        phone.trim()
      );

      if (!o) {
        setError(
          "Order not found. Please check your order number and phone number."
        );
        setOrder(null);
        setItems([]);
      } else {
        setOrder(o);
        setItems(it);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.value === status);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-8 md:py-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            Track Your Order
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Enter your order number and phone number
          </p>
        </div>
      </div>

      <div className="container-custom py-8 md:py-14">
        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 p-5 md:p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Order Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                placeholder="DRK-0001"
                className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Searching...
                </>
              ) : (
                "Track Order"
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-4 py-3">
              {error}
            </div>
          )}

          {/* Order Result */}
          {order && (
            <div className="mt-6 space-y-5">
              {/* Order Header */}
              <div className="bg-gray-50 border border-gray-200 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Order Number
                    </p>
                    <p className="text-lg font-bold">
                      {order.order_number}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Placed On
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Progress */}
              <div className="border border-gray-200 p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider mb-4">
                  Order Status
                </h2>

                {order.order_status === "cancelled" ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 text-center">
                    <p className="font-bold text-sm uppercase">
                      Order Cancelled
                    </p>
                    <p className="text-xs mt-1">
                      This order has been cancelled. Contact support for more
                      info.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 -z-0">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{
                          width: `${
                            (getCurrentStepIndex(order.order_status) /
                              (STATUS_STEPS.length - 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between z-10">
                      {STATUS_STEPS.map((step, index) => {
                        const currentIndex = getCurrentStepIndex(
                          order.order_status
                        );
                        const isCompleted = index <= currentIndex;
                        const isActive = index === currentIndex;

                        return (
                          <div
                            key={step.value}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition ${
                                isCompleted
                                  ? "bg-black text-white"
                                  : "bg-white border-2 border-gray-300 text-gray-400"
                              } ${
                                isActive
                                  ? "ring-4 ring-gray-200"
                                  : ""
                              }`}
                            >
                              {STATUS_ICONS[step.icon]}
                            </div>
                            <p
                              className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mt-2 text-center ${
                                isCompleted ? "text-black" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              {items.length > 0 && (
                <div className="border border-gray-200">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h2 className="text-xs font-bold uppercase tracking-wider">
                      Items ({items.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3">
                        <div className="w-14 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-2">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && " • "}
                            {item.color && item.color}
                          </p>
                          <p className="text-xs font-bold mt-1">
                            ৳{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <div className="border border-gray-200">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider">
                    Delivery To
                  </h2>
                </div>
                <div className="p-4 text-sm space-y-1">
                  <p className="font-semibold">{order.customer_name}</p>
                  <p className="text-gray-600">{order.customer_phone}</p>
                  <p className="text-gray-600">
                    {order.address}, {order.area}, {order.district},{" "}
                    {order.division}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ৳{order.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">
                    ৳{order.delivery_charge.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>৳{order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact Support */}
              <div className="text-center pt-4">
                <p className="text-xs md:text-sm text-gray-500 mb-3">
                  Need help with your order?
                </p>
                <a
                  href={`https://wa.me/8801820563338?text=Hi, I need help with my order ${order.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wide border-b-2 border-black hover:text-gray-600 hover:border-gray-400 transition pb-0.5"
                >
                  Contact Support on WhatsApp →
                </a>
              </div>
            </div>
          )}

          {/* Initial State (Before Search) */}
          {!searched && !loading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 px-4 py-3 text-xs md:text-sm text-blue-700">
              <strong>Tip:</strong> Your order number was shown on the order
              success page. Check your email or SMS if you can&apos;t find it.
            </div>
          )}
        </div>
      </div>

      <FooterClientOnly />
    </main>
  );
}