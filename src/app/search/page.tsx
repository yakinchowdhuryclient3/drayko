"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";
import ProductCard from "@/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/queries/products";
import type { Category } from "@/lib/queries/categories";

type SortOption = "relevance" | "price-low" | "price-high" | "newest";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(
            `
            *,
            categories (slug, name),
            product_images (image_url, sort_order)
          `
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (productsError) {
          console.error("Products error:", productsError);
        } else {
          const formatted: Product[] = (productsData || []).map((p: any) => {
            const images =
              p.product_images
                ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((img: any) => img.image_url) || [];

            let colors: { name: string; hex: string }[] = [];
            if (Array.isArray(p.colors)) {
              colors = p.colors
                .map((c: any) => {
                  if (typeof c === "string") {
                    return { name: c, hex: "#888888" };
                  }
                  if (
                    c &&
                    typeof c === "object" &&
                    typeof c.name === "string" &&
                    typeof c.hex === "string"
                  ) {
                    return { name: c.name, hex: c.hex };
                  }
                  return null;
                })
                .filter(
                  (c: any): c is { name: string; hex: string } => c !== null
                );
            }

            return {
              ...p,
              colors,
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              category_slug: p.categories?.slug,
              category_name: p.categories?.name,
              image: images[0] || "/placeholder.jpg",
              images,
            };
          });

          setAllProducts(formatted);
        }

        const { data: catData } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        setCategories((catData as Category[]) || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort
  const results = useMemo(() => {
    let filtered = [...allProducts];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category_slug && p.category_slug.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category_slug === selectedCategory);
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => {
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [allProducts, query, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container-custom py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Search Results
          </h1>
          {query && !loading && (
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              {results.length} results for &quot;{query}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-6 md:py-10">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Sidebar — Sort By all screens, Categories desktop only */}
            <aside className="lg:col-span-1">
              <div className="space-y-6 lg:sticky lg:top-24">
                {/* Sort By — All screens */}
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

                {/* Categories — Desktop only */}
                <div className="hidden lg:block">
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
                      <li key={cat.id}>
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
              </div>
            </aside>

            {/* Results */}
            <div className="lg:col-span-3">
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 md:py-24">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold mb-2">
                    No products found
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Try a different search term
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition"
                  >
                    Back to Home
                  </Link>
                </div>
              )}
            </div>
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
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}