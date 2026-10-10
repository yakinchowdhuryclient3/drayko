import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryProducts from "@/components/home/CategoryProducts";
import Footer from "@/components/layout/Footer";
import { getCategories } from "@/lib/queries/categories";

export const revalidate = 300;

export default async function Home() {
  const categories = await getCategories();

  const orderedCategories = [...categories].sort((a, b) => {
    if (a.slug === "winter-collection") return -1;
    if (b.slug === "winter-collection") return 1;
    return a.sort_order - b.sort_order;
  });

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />
      <HeroSlider />

      <div>
        {orderedCategories.map((category) => (
          <CategoryProducts
            key={category.id}
            title={category.name}
            slug={category.slug}
            limit={4}
          />
        ))}
      </div>

      <Footer />
    </main>
  );
}