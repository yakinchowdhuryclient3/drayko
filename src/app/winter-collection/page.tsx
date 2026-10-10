import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WinterCollectionClient from "./WinterCollectionClient";
import { getProductsByCategory } from "@/lib/queries/products";

export const metadata = {
  title: "Winter Collection - Drayko",
  description: "Premium winter collection for men",
};

export default async function WinterCollectionPage() {
  const products = await getProductsByCategory("winter-collection");

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container-custom py-8 md:py-12">
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-blue-700 mb-2">
            Season 2026
          </p>
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            Winter Collection
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            {products.length} products — Premium warmth, timeless style
          </p>
        </div>
      </div>

      <WinterCollectionClient products={products} />

      <Footer />
    </main>
  );
}