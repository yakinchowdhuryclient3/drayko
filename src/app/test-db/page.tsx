import { getCategories } from "@/lib/queries/categories";
import { getProducts } from "@/lib/queries/products";
import { getSlides } from "@/lib/queries/slides";
import { getMenuItems } from "@/lib/queries/menu-items";
import { getSettings } from "@/lib/queries/settings";

export default async function TestDbPage() {
  const [categories, products, slides, menuItems, settings] =
    await Promise.all([
      getCategories(),
      getProducts(),
      getSlides(),
      getMenuItems(),
      getSettings(),
    ]);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Database Test</h1>

      <div className="space-y-6">
        <div className="border p-4">
          <h2 className="font-bold mb-2">
            Categories: {categories.length}
          </h2>
          <p className="text-sm">
            {categories.map((c) => c.name).join(", ")}
          </p>
        </div>

        <div className="border p-4">
          <h2 className="font-bold mb-2">Products: {products.length}</h2>
          <p className="text-sm">
            {products.slice(0, 3).map((p) => p.name).join(", ")}...
          </p>
        </div>

        <div className="border p-4">
          <h2 className="font-bold mb-2">Slides: {slides.length}</h2>
          <p className="text-sm">
            {slides.map((s) => s.title).join(", ")}
          </p>
        </div>

        <div className="border p-4">
          <h2 className="font-bold mb-2">Menu Items: {menuItems.length}</h2>
          <p className="text-sm">
            {menuItems.slice(0, 5).map((m) => m.label).join(", ")}...
          </p>
        </div>

        <div className="border p-4">
          <h2 className="font-bold mb-2">Settings</h2>
          <p className="text-sm">
            Site: {settings.site_name} | Phone: {settings.contact_phone}
          </p>
        </div>
      </div>
    </div>
  );
}