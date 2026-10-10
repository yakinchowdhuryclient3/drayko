"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import { products as staticProducts } from "@/data/products";
import { categories } from "@/data/categories";

type SortOption = "relevance" | "price-low" | "price-high" | "newest";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const results = useMemo(() => {
    let filtered = [...staticProducts];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categorySlug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categorySlug === selectedCategory);
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
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
  }, [query, selectedCategory, sortBy, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-6 md:py-10">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            Search
          </h1>
          {query && (
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              {results.length} results for &quot;{query}&quot;
            </p>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="container-custom py-4">
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full h-11 pl-5 pr-12 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
          </form>
        </div>
      </div>

      <div className="container-custom py-6 md:py-10">
        {results.length > 0 || query ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <aside className="lg:col-span-1">
              <div className="space-y-6 lg:sticky lg:top-24">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                    Sort By
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                    Categories
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`transition text-left w-full ${
                          selectedCategory === "all"
                            ? "font-bold text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.slug}>
                        <button
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`transition text-left w-full ${
                            selectedCategory === cat.slug
                              ? "font-bold text-black"
                              : "text-gray-600 hover:text-black"
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Min: ৳{priceRange[0].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([
                            Math.min(
                              Number(e.target.value),
                              priceRange[1] - 100
                            ),
                            priceRange[1],
                          ])
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Max: ৳{priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            Math.max(
                              Number(e.target.value),
                              priceRange[0] + 100
                            ),
                          ])
                        }
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => setPriceRange([0, 10000])}
                      className="text-xs text-gray-500 hover:text-black underline"
                    >
                      Reset price
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 md:py-24">
                  <h2 className="text-lg md:text-xl font-bold mb-2">
                    No products found
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Try a different search term or adjust filters
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 md:py-24">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Start Searching
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Type a product name to search
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>

      <FooterClientOnly />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}