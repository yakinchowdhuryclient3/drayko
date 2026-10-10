"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/queries/products";

type SortOption = "relevance" | "price-low" | "price-high" | "newest";

type Props = {
  products: Product[];
};

export default function CategoryClient({ products }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => {
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return 0;
        });
        break;
      default:
        break;
    }

    return sorted;
  }, [products, sortBy]);

  return (
    <div className="container-custom py-6 md:py-10">
      {sortedProducts.length > 0 && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <p className="text-xs md:text-sm text-gray-600">
            Showing{" "}
            <span className="font-bold text-black">
              {sortedProducts.length}
            </span>{" "}
            products
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-3 border border-gray-300 text-xs md:text-sm focus:outline-none focus:border-black transition bg-white"
          >
            <option value="relevance">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      )}

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">
            এই category তে এখনো কোনো product নেই।
          </p>
          <Link
            href="/"
            className="inline-block mt-6 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}