"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FooterClient from "./FooterClient";

type SettingsData = {
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
  copyright_text: string;
};

const defaultData: SettingsData = {
  site_name: "Drayko",
  site_tagline: "For Alpha Males, By Alpha Males",
  site_description:
    "We believe less is more—but never boring. Our collections are built around refined essentials and elevated basics.",
  contact_phone: "+880 1820-563338",
  contact_whatsapp: "8801820563338",
  contact_email: "draykowears@gmail.com",
  contact_address: "Barik Building, Agrabad, Chittagong, Bangladesh, 4100",
  social_facebook: "https://www.facebook.com/share/19ZoExzP4x/",
  social_instagram: "https://www.instagram.com/drayko_wears",
  social_whatsapp: "https://wa.me/8801820563338",
  copyright_text: "All rights reserved.",
};

export default function FooterClientOnly() {
  const [data, setData] = useState<SettingsData>(defaultData);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("settings")
      .select("*")
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          const settings: Record<string, string> = {};
          rows.forEach((row: { key: string; value: string }) => {
            settings[row.key] = row.value;
          });

          setData({
            site_name: settings.site_name || defaultData.site_name,
            site_tagline: settings.site_tagline || defaultData.site_tagline,
            site_description:
              settings.site_description || defaultData.site_description,
            contact_phone:
              settings.contact_phone || defaultData.contact_phone,
            contact_whatsapp:
              settings.contact_whatsapp || defaultData.contact_whatsapp,
            contact_email:
              settings.contact_email || defaultData.contact_email,
            contact_address:
              settings.contact_address || defaultData.contact_address,
            social_facebook:
              settings.social_facebook || defaultData.social_facebook,
            social_instagram:
              settings.social_instagram || defaultData.social_instagram,
            social_whatsapp:
              settings.social_whatsapp || defaultData.social_whatsapp,
            copyright_text:
              settings.copyright_text || defaultData.copyright_text,
          });
        }
      });
  }, []);

  return <FooterClient data={data} />;
}