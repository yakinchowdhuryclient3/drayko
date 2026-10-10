import { createClient } from "@/lib/supabase/server";

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return data || [];
}