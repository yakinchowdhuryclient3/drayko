import Link from "next/link";
import { getProductsByCategory } from "@/lib/queries/products";
import ProductCard from "@/components/ui/ProductCard";

type Props = {
  title: string;
  slug: string;
  limit?: number;
};

export default async function CategoryProducts({
  title,
  slug,
  limit = 4,
}: Props) {
  const products = await getProductsByCategory(slug, limit);

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white border-b border-gray-100">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide">
              {title}
            </h2>
            <div className="w-12 h-1 bg-black mt-2" />
          </div>

          <Link
            href={`/category/${slug}`}
            className="text-xs md:text-sm font-semibold uppercase tracking-wide border-b-2 border-black hover:text-gray-500 hover:border-gray-500 transition pb-0.5"
          >
            Show More →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}