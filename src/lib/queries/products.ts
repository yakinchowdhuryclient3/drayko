import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ColorItem = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  sizes: string[];
  colors: ColorItem[];
  rating: number;
  reviews_count: number;
  is_sale: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  size_guide_url: string | null;
  category_slug?: string;
  category_name?: string;
  image?: string;
  images?: string[];
};

async function formatProduct(supabase: any, product: any): Promise<Product> {
  const images =
    product.product_images
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => img.image_url) || [];

  let colors: ColorItem[] = [];
  if (Array.isArray(product.colors)) {
    colors = product.colors
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
      .filter((c: any): c is ColorItem => c !== null);
  }

  return {
    ...product,
    colors,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    category_slug: product.categories?.slug,
    category_name: product.categories?.name,
    image: images[0] || "/placeholder.jpg",
    images,
  };
}

// ⭐ STATIC version — for build time (generateStaticParams)
export async function getProductsStatic(
  categorySlug?: string,
  limit?: number
): Promise<Product[]> {
  const supabase = createAdminClient();

  let query: any;

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .single();

    if (!category) return [];

    query = supabase
      .from("products")
      .select(
        `
        *,
        categories (slug, name),
        product_images (image_url, sort_order)
      `
      )
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
  } else {
    query = supabase
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
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products (static):", error);
    return [];
  }

  return Promise.all(
    (data || []).map((p: any) => formatProduct(supabase, p))
  );
}

// ⭐ RUNTIME version
export async function getProducts(limit?: number): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
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

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return Promise.all(
    (data || []).map((p: any) => formatProduct(supabase, p))
  );
}

export async function getProductsByCategory(
  categorySlug: string,
  limit?: number
): Promise<Product[]> {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .single();

  if (!category) return [];

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories (slug, name),
      product_images (image_url, sort_order)
    `
    )
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return Promise.all(
    (data || []).map((p: any) => formatProduct(supabase, p))
  );
}

// ⭐ getProductById — uses admin client for build time compatibility
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (slug, name),
      product_images (image_url, sort_order)
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching product:", error);
    return null;
  }

  return formatProduct(supabase, data);
}

export async function getSaleProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (slug, name),
      product_images (image_url, sort_order)
    `
    )
    .eq("is_sale", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sale products:", error);
    return [];
  }

  return Promise.all(
    (data || []).map((p: any) => formatProduct(supabase, p))
  );
}