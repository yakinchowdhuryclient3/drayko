import { getSettings } from "@/lib/queries/settings";
import FooterClient from "./FooterClient";

export default async function FooterServer() {
  const settings = await getSettings();

  // Fallback if DB empty
  const data = {
    site_name: settings.site_name || "Drayko",
    site_tagline: settings.site_tagline || "For Alpha Males, By Alpha Males",
    site_description:
      settings.site_description ||
      "We believe less is more—but never boring.",
    contact_phone: settings.contact_phone || "+880 1820-563338",
    contact_whatsapp: settings.contact_whatsapp || "8801820563338",
    contact_email: settings.contact_email || "draykowears@gmail.com",
    contact_address:
      settings.contact_address ||
      "Barik Building, Agrabad, Chittagong, Bangladesh, 4100",
    social_facebook:
      settings.social_facebook ||
      "https://www.facebook.com/share/19ZoExzP4x/",
    social_instagram:
      settings.social_instagram || "https://www.instagram.com/drayko_wears",
    social_whatsapp:
      settings.social_whatsapp || "https://wa.me/8801820563338",
    copyright_text: settings.copyright_text || "All rights reserved.",
  };

  return <FooterClient data={data} />;
}