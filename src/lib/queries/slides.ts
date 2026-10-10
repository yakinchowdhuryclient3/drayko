import { createClient } from "@/lib/supabase/server";

export type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function getSlides(): Promise<Slide[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching slides:", error);
    return [];
  }

  return data || [];
}