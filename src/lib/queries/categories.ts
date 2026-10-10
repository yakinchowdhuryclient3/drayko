import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

// ⭐ For build time (generateStaticParams) — uses admin client
export async function getCategoriesStatic(): Promise<Category[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories (static):", error);
    return [];
  }

  return data || [];
}

// ⭐ For runtime (server components) — uses server client
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data;
}