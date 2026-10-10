"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  products: number;
  categories: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
  lowStock: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  order_status: string;
  created_at: string;
};

type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
  image: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    orders: 0,
    pendingOrders: 0,
    revenue: 0,
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      // Products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Categories count
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Orders count
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Pending orders
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("order_status", "pending");

      // Revenue (all non-cancelled orders)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total")
        .neq("order_status", "cancelled");

      const revenue = (ordersData || []).reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

      // Low stock products (< 5)
      const { data: lowStockData } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          stock,
          product_images (image_url, sort_order)
        `
        )
        .lt("stock", 5)
        .eq("is_active", true)
        .order("stock", { ascending: true })
        .limit(5);

      const formattedLowStock = (lowStockData || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        image:
          p.product_images?.sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          )[0]?.image_url || null,
      }));

      // Recent orders (last 5)
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, order_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        products: productsCount || 0,
        categories: categoriesCount || 0,
        orders: ordersCount || 0,
        pendingOrders: pendingCount || 0,
        revenue,
        lowStock: lowStockData?.length || 0,
      });
      setRecentOrders(recentOrdersData || []);
      setLowStockProducts(formattedLowStock);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    return STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
          Dashboard
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Overview of your store
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {/* Total Products */}
        <Link
          href="/admin/products"
          className="bg-white border border-gray-200 p-4 md:p-5 hover:border-black transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Products
          </p>
          <p className="text-2xl md:text-3xl font-bold">
            {loading ? "..." : stats.products}
          </p>
        </Link>

        {/* Total Categories */}
        <Link
          href="/admin/categories"
          className="bg-white border border-gray-200 p-4 md:p-5 hover:border-black transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Categories
          </p>
          <p className="text-2xl md:text-3xl font-bold">
            {loading ? "..." : stats.categories}
          </p>
        </Link>

        {/* Total Orders */}
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 p-4 md:p-5 hover:border-black transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            {stats.pendingOrders > 0 && (
              <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 uppercase">
                {stats.pendingOrders} pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Total Orders
          </p>
          <p className="text-2xl md:text-3xl font-bold">
            {loading ? "..." : stats.orders}
          </p>
        </Link>

        {/* Revenue */}
        <div className="bg-white border border-gray-200 p-4 md:p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
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
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Revenue
          </p>
          <p className="text-2xl md:text-3xl font-bold">
            {loading ? "..." : `৳${stats.revenue.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm">
                        {order.order_number}
                      </p>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 ${getStatusBadge(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {order.customer_name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-bold text-sm">
                      ৳{order.total.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* LOW STOCK */}
        <div className="bg-white border border-gray-200">
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">
              Low Stock
            </h2>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1 uppercase">
              &lt; 5 items
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No low stock products 🎉
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-12 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2">
                      {product.name}
                    </p>
                    <p
                      className={`text-[10px] font-bold mt-0.5 ${
                        product.stock === 0
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      Stock: {product.stock}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-sm md:text-base font-bold uppercase tracking-wide mb-3 md:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/products"
            className="bg-white border border-gray-200 p-4 hover:border-black transition flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <svg
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              Add Product
            </span>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white border border-gray-200 p-4 hover:border-black transition flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <svg
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              Add Category
            </span>
          </Link>

          <Link
            href="/admin/slides"
            className="bg-white border border-gray-200 p-4 hover:border-black transition flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <svg
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              Add Slide
            </span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="bg-black text-white p-4 hover:bg-gray-800 transition flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <svg
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              View Site
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}