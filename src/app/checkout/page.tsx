"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/queries/orders";

const divisions = [
  "Chittagong",
  "Dhaka",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const deliveryCharges: Record<string, number> = {
  Chittagong: 70,
  Dhaka: 130,
  Rajshahi: 130,
  Khulna: 130,
  Barishal: 130,
  Sylhet: 130,
  Rangpur: 130,
  Mymensingh: 130,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    altPhone: "",
    division: "",
    district: "",
    area: "",
    address: "",
    note: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = form.division
    ? deliveryCharges[form.division] || 130
    : 0;

  const grandTotal = totalPrice + deliveryCharge;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^01[3-9]\d{8}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid 11-digit phone number";

    if (!form.division) newErrors.division = "Select a division";
    if (!form.district.trim()) newErrors.district = "District is required";
    if (!form.area.trim()) newErrors.area = "Area is required";
    if (!form.address.trim()) newErrors.address = "Full address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      const orderInput = {
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim() || undefined,
        alt_phone: form.altPhone.trim() || undefined,
        division: form.division,
        district: form.district.trim(),
        area: form.area.trim(),
        address: form.address.trim(),
        delivery_note: form.note.trim() || undefined,
        subtotal: totalPrice,
        delivery_charge: deliveryCharge,
        total: grandTotal,
        payment_method: form.paymentMethod,
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image || null,
          size: item.size || "",
          color: item.color || "",
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const { order, error } = await createOrder(orderInput);

      if (error || !order) {
        alert("Failed to place order: " + (error || "Unknown error"));
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(
        `/order-success?orderId=${order.order_number}&phone=${order.customer_phone}`
      );
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <TopBarClientOnly />
        <NavbarClientOnly />
        <div className="container-custom py-16 md:py-24 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-500 mb-8">
            Add products before proceeding to checkout
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
        <FooterClientOnly />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      <div className="container-custom py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Checkout
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-gray-500">
            <Link href="/cart" className="hover:text-black transition">
              Cart
            </Link>
            <span>→</span>
            <span className="text-black font-semibold">Checkout</span>
            <span>→</span>
            <span>Confirmation</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="border border-gray-200 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide mb-4 pb-3 border-b border-gray-200">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`w-full h-11 px-3 border text-sm focus:outline-none transition ${
                        errors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className={`w-full h-11 px-3 border text-sm focus:outline-none transition ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Alternative Phone
                    </label>
                    <input
                      type="tel"
                      name="altPhone"
                      value={form.altPhone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX (optional)"
                      maxLength={11}
                      className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-gray-200 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide mb-4 pb-3 border-b border-gray-200">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Division <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="division"
                      value={form.division}
                      onChange={handleChange}
                      className={`w-full h-11 px-3 border text-sm focus:outline-none transition bg-white ${
                        errors.division
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    >
                      <option value="">Select Division</option>
                      {divisions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.division && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.division}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      District <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="Enter district"
                      className={`w-full h-11 px-3 border text-sm focus:outline-none transition ${
                        errors.district
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.district && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Area / Thana <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="e.g. Agrabad, Halishahar"
                      className={`w-full h-11 px-3 border text-sm focus:outline-none transition ${
                        errors.area
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.area && (
                      <p className="text-xs text-red-600 mt-1">{errors.area}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Full Address <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House/Building, Road, Landmark..."
                      rows={3}
                      className={`w-full px-3 py-2.5 border text-sm focus:outline-none transition resize-none ${
                        errors.address
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Delivery Note (optional)
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Any special instruction for delivery..."
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-gray-200 p-5 md:p-6">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide mb-4 pb-3 border-b border-gray-200">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 border cursor-pointer transition ${
                      form.paymentMethod === "cod"
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        Cash on Delivery
                      </div>
                      <div className="text-xs text-gray-500">
                        Pay when you receive the product
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 cursor-not-allowed opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      disabled
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        bKash / Nagad{" "}
                        <span className="text-[10px] bg-gray-200 px-2 py-0.5 ml-1 uppercase">
                          Coming Soon
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Online payment will be available soon
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 p-5 md:p-6 sticky top-24">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide mb-4 pb-3 border-b border-gray-200">
                  Order Summary
                </h2>

                <div className="max-h-64 overflow-y-auto space-y-3 mb-4 pb-4 border-b border-gray-200">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}-${index}`}
                      className="flex gap-3"
                    >
                      <div className="relative w-14 h-16 bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-semibold line-clamp-2 leading-snug">
                          {item.name}
                        </div>
                        <div className="text-gray-500 mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && item.color}
                        </div>
                        <div className="font-bold mt-1">
                          ৳{item.price.toLocaleString()} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ৳{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold">
                      {form.division ? (
                        `৳${deliveryCharge}`
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          Select division
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-5 bg-black text-white py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
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
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <FooterClientOnly />
    </main>
  );
}