"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

type Props = {
  items: MenuItem[];
};

// ============ COLOR CLASS HELPER ============
const getColorClass = (color: string) => {
  const map: Record<string, string> = {
    default: "hover:text-gray-500",
    red: "text-red-600 hover:text-red-700",
    pink: "text-pink-600 hover:text-pink-700",
    skyblue: "text-sky-600 hover:text-sky-700",
    green: "text-green-600 hover:text-green-700",
    orange: "text-orange-600 hover:text-orange-700",
    purple: "text-purple-600 hover:text-purple-700",
    yellow: "text-yellow-600 hover:text-yellow-700",
    teal: "text-teal-600 hover:text-teal-700",
    indigo: "text-indigo-600 hover:text-indigo-700",
  };
  return map[color] || map.default;
};

const getMobileColorClass = (color: string) => {
  const map: Record<string, string> = {
    default: "hover:text-gray-500",
    red: "text-red-600",
    pink: "text-pink-600",
    skyblue: "text-sky-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
    teal: "text-teal-600",
    indigo: "text-indigo-600",
  };
  return map[color] || map.default;
};

export default function NavbarClient({ items }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems } = useCart();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:block">
        <div className="container-custom">
          <ul className="flex items-center justify-between py-3 text-[11px] xl:text-[12px] font-bold tracking-wide uppercase whitespace-nowrap">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`transition ${getColorClass(item.color)}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button className="flex items-center gap-1 hover:text-gray-500 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                All Categories
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            className="p-1"
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Drayko"
              className="object-contain h-9 w-auto"
            />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative hover:opacity-70 transition p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0 -right-0 bg-red-600 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
        </div>

        <form
          onSubmit={handleSearch}
          className="px-4 py-2 border-b border-gray-100"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400 transition"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </form>

        <div className="overflow-x-auto no-scrollbar border-b border-gray-100">
          <ul className="flex items-center gap-5 px-4 py-3 text-[12px] font-bold uppercase whitespace-nowrap">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`transition ${getMobileColorClass(item.color)}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {mobileMenuOpen && (
          <div className="bg-white border-b border-gray-200">
            <ul className="py-2">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2.5 text-sm font-semibold uppercase hover:bg-gray-50 ${getMobileColorClass(
                      item.color
                    )}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}