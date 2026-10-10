"use client";

import { useState, useMemo } from "react";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";

type SortOption = "discount-high" | "price-low" | "price-high" | "newest";

export default function SalePage() {
  const [sortBy, setSortBy] = useState<SortOption>("discount-high");

  const saleProducts = useMemo(() => {
    const filtered = products.filter((p) => p.isSale);

    switch (sortBy) {
      case "discount-high":
        filtered.sort((a, b) => {
          const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return db - da;
        });
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [sortBy]);

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      <div className="border-b border-gray-200 bg-red-50">
        <div className="container-custom py-6 md:py-10">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider">
              Sale
            </span>
            <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide text-red-600">
              Flat Sale
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            {saleProducts.length} products on sale
          </p>
        </div>
      </div>

      <div className="container-custom py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <p className="text-xs md:text-sm text-gray-600">
            Showing{" "}
            <span className="font-bold text-black">{saleProducts.length}</span>{" "}
            products
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-3 border border-gray-300 text-xs md:text-sm focus:outline-none focus:border-black transition bg-white"
          >
            <option value="discount-high">Sort: Biggest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {saleProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No sale products available</p>
          </div>
        )}
      </div>

      <FooterClientOnly />
    </main>
  );
}