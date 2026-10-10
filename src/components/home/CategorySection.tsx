import { categories } from "@/data/categories";
import CategoryCard from "@/components/ui/CategoryCard";

export default function CategorySection() {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container-custom">
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Shop by Category
          </h2>
          <div className="w-16 h-1 bg-black mx-auto mt-3" />
        </div>

        {/* Categories Grid - 9 items */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-4 md:gap-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}