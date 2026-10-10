import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryProducts from "@/components/home/CategoryProducts";
import Footer from "@/components/layout/Footer";
import { getCategories } from "@/lib/queries/categories";

export default async function Home() {
  const categories = await getCategories();

  // Sort categories to put Winter Collection first, Women's Collection before Slides
  const orderedCategories = [...categories].sort((a, b) => {
    // Winter Collection first
    if (a.slug === "winter-collection") return -1;
    if (b.slug === "winter-collection") return 1;
    // Otherwise keep original sort_order
    return a.sort_order - b.sort_order;
  });

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />
      <HeroSlider />

      {/* Dynamic Categories */}
      {orderedCategories.map((category) => (
        <CategoryProducts
          key={category.id}
          title={category.name}
          slug={category.slug}
          limit={4}
        />
      ))}

      <Footer />
    </main>
  );
}