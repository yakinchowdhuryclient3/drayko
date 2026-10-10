import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  site_name: string;
  site_tagline: string;
  site_description: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_address: string;
  social_facebook: string;
  social_instagram: string;
  social_whatsapp: string;
  delivery_charge_chittagong: string;
  delivery_charge_outside: string;
  copyright_text: string;
};

export async function getSettings(): Promise<Partial<SiteSettings>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("settings").select("*");

  if (error) {
    console.error("Error fetching settings:", error);
    return {};
  }

  // Convert array of {key, value} to object
  const settings: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return settings as Partial<SiteSettings>;
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) return null;
  return data?.value || null;
}