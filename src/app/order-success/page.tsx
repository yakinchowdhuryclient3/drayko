"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import {
  getOrderByNumber,
  type Order,
  type OrderItem,
} from "@/lib/queries/orders";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderId") || "";
  const phone = searchParams.get("phone") || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber || !phone) {
        setLoading(false);
        return;
      }

      const { order: o, items: it } = await getOrderByNumber(
        orderNumber,
        phone
      );

      setOrder(o);
      setItems(it);
      setLoading(false);
    };

    fetchOrder();
  }, [orderNumber, phone]);

  // ============ WHATSAPP NOTIFICATION (OPTIONAL) ============
  const sendWhatsAppNotification = () => {
    if (!order) return;

    const itemsList = items
      .map(
        (item, i) =>
          `${i + 1}. ${item.product_name}${item.size ? ` (${item.size})` : ""}${
            item.color ? ` - ${item.color}` : ""
          } x ${item.quantity} = ৳${(item.price * item.quantity).toLocaleString()}`
      )
      .join("%0A");

    const text = `*New Order Confirmation*%0A%0A*Order Number:* ${
      order.order_number
    }%0A*Name:* ${order.customer_name}%0A*Phone:* ${
      order.customer_phone
    }%0A%0A*Items:*%0A${itemsList}%0A%0A*Subtotal:* ৳${order.subtotal.toLocaleString()}%0A*Delivery:* ৳${order.delivery_charge.toLocaleString()}%0A*Total:* ৳${order.total.toLocaleString()}%0A%0A*Delivery Address:*%0A${
      order.address
    }, ${order.area}, ${order.district}, ${order.division}%0A%0AThank you for your order!`;

    window.open(`https://wa.me/8801820563338?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="inline-block animate-spin">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 mt-3">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 md:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-sm md:text-base text-gray-600">
            Thank you for your order. We&apos;ll contact you shortly to confirm.
          </p>
        </div>

        {/* Order Number */}
        {order && (
          <div className="bg-gray-50 border border-gray-200 p-5 md:p-6 mb-6">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
                Order Number
              </span>
              <span className="font-bold text-base md:text-lg">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
                Status
              </span>
              <span className="text-xs md:text-sm font-bold text-orange-600 uppercase">
                {order.order_status}
              </span>
            </div>
          </div>
        )}

        {/* Order Items */}
        {items.length > 0 && (
          <div className="border border-gray-200 mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Order Items ({items.length})
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
                    <p className="text-xs text-gray-500 mt-1">
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

        {/* Delivery Info */}
        {order && (
          <div className="border border-gray-200 mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Delivery Information
              </h2>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Name: </span>
                <span className="font-semibold">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Phone: </span>
                <span className="font-semibold">{order.customer_phone}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Address: </span>
                <span className="font-semibold">
                  {order.address}, {order.area}, {order.district},{" "}
                  {order.division}
                </span>
              </div>
              {order.delivery_note && (
                <div>
                  <span className="text-gray-500 text-xs">Note: </span>
                  <span className="italic">{order.delivery_note}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {order && (
          <div className="bg-gray-50 border border-gray-200 p-4 md:p-5 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                ৳{order.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-semibold">
                ৳{order.delivery_charge.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
              <span>Total</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 pt-1">
              Payment:{" "}
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : order.payment_method}
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Link
            href="/"
            className="flex-1 text-center bg-black text-white px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/track-order"
            className="flex-1 text-center bg-white text-black border-2 border-black px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition"
          >
            Track Order
          </Link>
        </div>

        {/* ⭐ OPTIONAL WhatsApp Button — Smaller, less prominent */}
        {order && (
          <div className="flex justify-center mb-6">
            <button
              onClick={sendWhatsAppNotification}
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-green-600 transition underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Send order details to WhatsApp
            </button>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 px-4 py-3 text-xs md:text-sm text-blue-700">
          <strong>Note:</strong> আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে
          যোগাযোগ করবেন আপনার অর্ডার নিশ্চিত করার জন্য। Follow-up এর জন্য
          আপনার ফোন খোলা রাখুন।
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <OrderSuccessContent />
      </Suspense>
      <FooterClientOnly />
    </main>
  );
}