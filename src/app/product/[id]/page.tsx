import Link from "next/link";
import { notFound } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import {
  getProductById,
  getProductsByCategory,
} from "@/lib/queries/products";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category_slug
    ? await getProductsByCategory(product.category_slug)
    : [];

  const related = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "/placeholder.jpg"];

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
            {product.category_slug && (
              <>
                <Link
                  href={`/category/${product.category_slug}`}
                  className="hover:text-black transition"
                >
                  {product.category_name}
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
          <div>
            <ProductGallery images={images} name={product.name} />
          </div>
          <div>
            <ProductInfo
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.old_price ?? undefined,
                image: product.image || "/placeholder.jpg",
                images: product.images,
                categorySlug: product.category_slug || "",
                description: product.description ?? undefined,
                sizes: product.sizes,
                colors: product.colors,
                stock: product.stock,
                isSale: product.is_sale,
                isNew: product.is_new,
                rating: product.rating,
                reviews: product.reviews_count,
                sizeGuideUrl: (product as any).size_guide_url || null,
              }}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-10 md:py-14 border-t border-gray-200">
          <div className="container-custom">
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide">
                You May Also Like
              </h2>
              <div className="w-12 h-1 bg-black mt-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="group flex flex-col"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={p.image || "/placeholder.jpg"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {p.is_sale && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">
                        Sale
                      </span>
                    )}
                    {p.is_new && !p.is_sale && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-gray-600">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold">
                        ৳{p.price.toLocaleString()}
                      </span>
                      {p.old_price && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{p.old_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}