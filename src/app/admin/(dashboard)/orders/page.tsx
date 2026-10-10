"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  alt_phone: string | null;
  division: string;
  district: string;
  area: string;
  address: string;
  delivery_note: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-orange-100 text-orange-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-700" },
  { value: "shipped", label: "Shipped", color: "bg-indigo-100 text-indigo-700" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  // ============ LOAD ORDERS ============
  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ============ LOAD ORDER ITEMS ============
  const loadOrderItems = async (orderId: string) => {
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    return data || [];
  };

  // ============ VIEW ORDER ============
  const handleViewOrder = async (order: Order) => {
    const items = await loadOrderItems(order.id);
    setViewingOrder({ ...order, items });
  };

  // ============ UPDATE STATUS ============
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      await loadOrders();
      revalidateSite();
      // Update viewing order if open
      if (viewingOrder?.id === orderId) {
        setViewingOrder({ ...viewingOrder, order_status: newStatus });
      }
    }
    setUpdatingId(null);
  };

  // ============ DELETE ORDER ============
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This order and all its items will be permanently deleted."
      )
    )
      return;

    setDeletingId(id);
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      await loadOrders();
      if (viewingOrder?.id === id) setViewingOrder(null);
    }
    setDeletingId(null);
  };

  // ============ WHATSAPP CUSTOMER ============
  const handleWhatsAppCustomer = (order: Order) => {
    const statusLabel =
      STATUS_OPTIONS.find((s) => s.value === order.order_status)?.label ||
      order.order_status;

    const text = `Hello ${order.customer_name},%0A%0AYour order *${order.order_number}* status has been updated to *${statusLabel}*.%0A%0AOrder Total: ৳${order.total.toLocaleString()}%0A%0AThank you for shopping with Drayko!`;

    window.open(
      `https://wa.me/${order.customer_phone.replace(/^0/, "88")}?text=${text}`,
      "_blank"
    );
  };

  // ============ FILTER ============
  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q);

    const matchesStatus =
      filterStatus === "all" || o.order_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ============ STATS ============
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order_status === "pending").length,
    delivered: orders.filter((o) => o.order_status === "delivered").length,
    revenue: orders
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  const getStatusBadge = (status: OrderStatus) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    return option || STATUS_OPTIONS[0];
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
    <div className="p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
          Orders
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Manage customer orders
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Total Orders
          </p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-orange-600">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Delivered
          </p>
          <p className="text-2xl font-bold text-green-600">
            {stats.delivered}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Revenue
          </p>
          <p className="text-2xl font-bold">
            ৳{stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number, name, or phone..."
          className="flex-1 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white md:w-64"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          {searchQuery || filterStatus !== "all"
            ? "No orders match your filters"
            : "No orders yet. Orders will appear here when customers place them."}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => {
              const badge = getStatusBadge(order.order_status);
              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-2 mt-2 space-y-1 text-sm">
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      {order.customer_phone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.area}, {order.district}
                    </p>
                    <p className="font-bold pt-1">
                      ৳{order.total.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="flex-1 h-9 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleWhatsAppCustomer(order)}
                      className="h-9 px-3 border border-green-300 text-xs font-bold uppercase tracking-wider text-green-600 hover:bg-green-50 transition"
                      aria-label="WhatsApp"
                    >
                      WA
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="h-9 px-3 border border-red-300 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === order.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden md:block bg-white border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Order #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Total
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((order) => {
                    const badge = getStatusBadge(order.order_status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-sm">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.customer_phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-sm">
                            ৳{order.total.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.order_status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            disabled={updatingId === order.id}
                            className={`text-[10px] font-bold uppercase px-2 py-1 border-0 focus:outline-none cursor-pointer ${badge.color} disabled:opacity-50`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800 transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleWhatsAppCustomer(order)}
                              className="text-xs font-semibold uppercase tracking-wide text-green-600 hover:text-green-800 transition"
                            >
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              disabled={deletingId === order.id}
                              className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800 transition disabled:opacity-50"
                            >
                              {deletingId === order.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setViewingOrder(null)}
        >
          <div
            className="bg-white w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-5 md:px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide">
                  {viewingOrder.order_number}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(viewingOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1 hover:bg-gray-100 transition"
                aria-label="Close"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Order Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() =>
                        handleStatusChange(viewingOrder.id, s.value)
                      }
                      disabled={updatingId === viewingOrder.id}
                      className={`text-[11px] font-bold uppercase px-3 py-2 border-2 transition disabled:opacity-50 ${
                        viewingOrder.order_status === s.value
                          ? "border-black"
                          : "border-transparent"
                      } ${s.color}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="border border-gray-200">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Customer
                  </h3>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Name: </span>
                    <span className="font-semibold">
                      {viewingOrder.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Phone: </span>
                    <a
                      href={`tel:${viewingOrder.customer_phone}`}
                      className="font-semibold hover:underline"
                    >
                      {viewingOrder.customer_phone}
                    </a>
                    {viewingOrder.alt_phone && (
                      <span className="text-gray-500 text-xs ml-2">
                        (Alt: {viewingOrder.alt_phone})
                      </span>
                    )}
                  </div>
                  {viewingOrder.customer_email && (
                    <div>
                      <span className="text-gray-500 text-xs">Email: </span>
                      <span className="font-semibold">
                        {viewingOrder.customer_email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="border border-gray-200">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Delivery Address
                  </h3>
                </div>
                <div className="p-4 text-sm space-y-1">
                  <p>{viewingOrder.address}</p>
                  <p className="text-gray-600">
                    {viewingOrder.area}, {viewingOrder.district},{" "}
                    {viewingOrder.division}
                  </p>
                  {viewingOrder.delivery_note && (
                    <p className="text-xs italic text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      Note: {viewingOrder.delivery_note}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              {viewingOrder.items && viewingOrder.items.length > 0 && (
                <div className="border border-gray-200">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Items ({viewingOrder.items.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {viewingOrder.items.map((item) => (
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
                            ৳{item.price.toLocaleString()} × {item.quantity} ={" "}
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ৳{viewingOrder.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">
                    ৳{viewingOrder.delivery_charge.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>৳{viewingOrder.total.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  Payment:{" "}
                  {viewingOrder.payment_method === "cod"
                    ? "Cash on Delivery"
                    : viewingOrder.payment_method}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleWhatsAppCustomer(viewingOrder)}
                  className="flex-1 h-11 bg-green-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp Customer
                </button>
                <button
                  onClick={() => handleDelete(viewingOrder.id)}
                  disabled={deletingId === viewingOrder.id}
                  className="flex-1 sm:flex-none sm:px-6 h-11 border border-red-300 text-sm font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {deletingId === viewingOrder.id ? "..." : "Delete Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}