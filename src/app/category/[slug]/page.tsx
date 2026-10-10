import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CategoryClient from "./CategoryClient";
import { getProductsByCategory } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [products, categories] = await Promise.all([
    getProductsByCategory(slug),
    getCategories(),
  ]);

  const category = categories.find((c) => c.slug === slug);
  const title = category?.name || slug.replace(/-/g, " ").toUpperCase();

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-6 md:py-10">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            {products.length} products found
          </p>
        </div>
      </div>

      {/* Products with Sort */}
      <CategoryClient products={products} />

      <Footer />
    </main>
  );
}