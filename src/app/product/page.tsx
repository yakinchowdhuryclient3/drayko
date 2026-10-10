import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const category = categories.find((c) => c.slug === product.categorySlug);

  // Build images array — if product has multiple images, use them; otherwise single
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-wide text-gray-500">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-black transition"
                >
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-black font-semibold truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery images={images} name={product.name} />
          </div>

          {/* Info */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        categorySlug={product.categorySlug}
      />

      <Footer />
    </main>
  );
}