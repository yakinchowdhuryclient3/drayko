"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";

type SettingsMap = Record<string, string>;

// Group settings by section for better UI
const SECTIONS = [
  {
    title: "Site Information",
    description: "Basic information about your website",
    fields: [
      { key: "site_name", label: "Site Name", placeholder: "Drayko" },
      {
        key: "site_tagline",
        label: "Tagline",
        placeholder: "For Alpha Males, By Alpha Males",
      },
      {
        key: "site_description",
        label: "Description",
        placeholder:
          "We believe less is more—but never boring.",
        type: "textarea",
      },
    ],
  },
  {
    title: "Contact Information",
    description: "How customers can reach you",
    fields: [
      {
        key: "contact_phone",
        label: "Phone Number",
        placeholder: "+880 1820-563338",
      },
      {
        key: "contact_whatsapp",
        label: "WhatsApp Number",
        placeholder: "8801820563338",
        hint: "Only numbers, no + or spaces",
      },
      {
        key: "contact_email",
        label: "Email",
        placeholder: "draykowears@gmail.com",
        type: "email",
      },
      {
        key: "contact_address",
        label: "Address",
        placeholder: "Barik Building, Agrabad, Chittagong, Bangladesh, 4100",
        type: "textarea",
      },
    ],
  },
  {
    title: "Social Links",
    description: "Social media profiles",
    fields: [
      {
        key: "social_facebook",
        label: "Facebook URL",
        placeholder: "https://facebook.com/yourpage",
        type: "url",
      },
      {
        key: "social_instagram",
        label: "Instagram URL",
        placeholder: "https://instagram.com/yourhandle",
        type: "url",
      },
      {
        key: "social_whatsapp",
        label: "WhatsApp Link",
        placeholder: "https://wa.me/8801820563338",
        type: "url",
      },
    ],
  },
  {
    title: "Delivery Charges",
    description: "Set delivery cost by area",
    fields: [
      {
        key: "delivery_charge_chittagong",
        label: "Chittagong (৳)",
        placeholder: "70",
        type: "number",
      },
      {
        key: "delivery_charge_outside",
        label: "Outside Chittagong (৳)",
        placeholder: "130",
        type: "number",
      },
    ],
  },
  {
    title: "Other",
    description: "Additional settings",
    fields: [
      {
        key: "copyright_text",
        label: "Copyright Text",
        placeholder: "All rights reserved.",
      },
    ],
  },
];

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();

  // ============ LOAD ============
  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("settings").select("*");

    if (error) {
      console.error("Error loading settings:", error);
    } else {
      const map: SettingsMap = {};
      (data || []).forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value || "";
      });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ============ HANDLE CHANGE ============
  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // ============ SAVE ALL ============
  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage("");

    try {
      // Get all existing keys from database
      const { data: existing } = await supabase
        .from("settings")
        .select("key");

      const existingKeys = new Set(
        (existing || []).map((e: { key: string }) => e.key)
      );

      // Prepare updates and inserts
      const updates: { key: string; value: string }[] = [];
      const inserts: { key: string; value: string }[] = [];

      Object.entries(settings).forEach(([key, value]) => {
        if (existingKeys.has(key)) {
          updates.push({ key, value });
        } else {
          inserts.push({ key, value });
        }
      });

      // Update existing
      for (const { key, value } of updates) {
        await supabase
          .from("settings")
          .update({ value })
          .eq("key", key);
      }

      // Insert new
      if (inserts.length > 0) {
        await supabase.from("settings").insert(inserts);
      }

      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      revalidateSite();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* HEADER */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Manage site-wide information
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
          ✓ {successMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading settings...
        </div>
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white border border-gray-200"
            >
              {/* Section Header */}
              <div className="border-b border-gray-200 px-5 md:px-6 py-4">
                <h2 className="text-base md:text-lg font-bold uppercase tracking-wide">
                  {section.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {section.description}
                </p>
              </div>

              {/* Fields */}
              <div className="p-5 md:p-6 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        value={settings[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition resize-none"
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={settings[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                      />
                    )}

                    {field.hint && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {field.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SAVE BUTTON */}
          <div className="sticky bottom-0 bg-gray-100 pt-4 pb-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save All Settings"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}