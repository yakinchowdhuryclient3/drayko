"use client";

import Link from "next/link";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      <div className="container-custom py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-6 md:mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            <div className="lg:col-span-2">
              <div className="border border-gray-200 divide-y divide-gray-200">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color}-${index}`}
                    className="flex gap-4 p-4"
                  >
                    <Link
                      href={`/product/${item.id}`}
                      className="relative w-20 h-24 md:w-24 md:h-32 bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-[10px] text-gray-400 text-center p-1">${item.name}</div>`;
                          }
                        }}
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/product/${item.id}`}
                          className="font-semibold text-sm md:text-base hover:text-gray-600 line-clamp-2 block"
                        >
                          {item.name}
                        </Link>

                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                          {item.size && (
                            <span>
                              Size:{" "}
                              <span className="font-medium">{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span>
                              Color:{" "}
                              <span className="font-medium">{item.color}</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm font-bold">
                          ৳{item.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 gap-2">
                        <div className="inline-flex items-center border border-gray-300">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.size,
                                item.color
                              )
                            }
                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-gray-100 transition"
                            aria-label="Decrease quantity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                          <span className="w-10 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.size,
                                item.color
                              )
                            }
                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-gray-100 transition"
                            aria-label="Increase quantity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
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
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.size, item.color)
                          }
                          className="text-xs text-gray-500 hover:text-red-600 transition uppercase tracking-wide"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 text-xs md:text-sm">
                <Link
                  href="/"
                  className="font-semibold uppercase tracking-wide hover:text-gray-600 transition"
                >
                  ← Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 font-semibold uppercase tracking-wide transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 border border-gray-200 p-5 md:p-6 sticky top-24">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide mb-4 pb-3 border-b border-gray-200">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      ৳{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-3">
                    <span className="text-gray-600 flex-shrink-0">
                      Delivery
                    </span>
                    <span className="text-xs text-gray-500 text-right italic">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
                    <span>Subtotal Total</span>
                    <span>৳{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full mt-5 bg-black text-white text-center py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
                >
                  Proceed to Checkout
                </Link>

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
        )}
      </div>

      <FooterClientOnly />
    </main>
  );
}