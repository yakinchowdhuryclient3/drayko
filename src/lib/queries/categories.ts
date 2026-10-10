import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

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