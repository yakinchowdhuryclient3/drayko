"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";
import {
  uploadImage,
  deleteImage,
  validateImage,
} from "@/lib/supabase/storage";

type Slide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  mobile_image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export default function SlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // ============ LOAD ============
  const loadSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading slides:", error);
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // ============ RESEQUENCE ============
  const resequenceAll = async () => {
    const { data: allSlides } = await supabase
      .from("slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!allSlides) return;

    for (let i = 0; i < allSlides.length; i++) {
      await supabase
        .from("slides")
        .update({ sort_order: -(i + 1) })
        .eq("id", allSlides[i].id);
    }

    for (let i = 0; i < allSlides.length; i++) {
      await supabase
        .from("slides")
        .update({ sort_order: i + 1 })
        .eq("id", allSlides[i].id);
    }
  };

  // ============ FORM ============
  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      image_url: "",
      cta_text: "",
      cta_link: "",
      is_active: true,
    });
  };

  const handleAddClick = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (slide: Slide) => {
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      image_url: slide.image_url,
      cta_text: slide.cta_text || "",
      cta_link: slide.cta_link || "",
      is_active: slide.is_active,
    });
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // ============ IMAGE UPLOAD ============
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);

    if (form.image_url) {
      await deleteImage(form.image_url, "slides");
    }

    const { url, error } = await uploadImage(file, "slides", "hero");

    if (error || !url) {
      alert("Upload failed: " + error);
      setUploading(false);
      return;
    }

    setForm({ ...form, image_url: url });
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!confirm("Remove this image?")) return;
    if (form.image_url) {
      await deleteImage(form.image_url, "slides");
    }
    setForm({ ...form, image_url: "" });
  };

  // ============ SAVE ============
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image_url) {
      alert("Please upload an image");
      return;
    }

    setSaving(true);

    const dataToSave = {
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      image_url: form.image_url,
      cta_text: form.cta_text.trim() || null,
      cta_link: form.cta_link.trim() || null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase
        .from("slides")
        .update(dataToSave)
        .eq("id", editingId);

      if (error) {
        alert("Error updating: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const nextOrder =
        slides.length > 0
          ? Math.max(...slides.map((s) => s.sort_order)) + 1
          : 1;

      const { error } = await supabase.from("slides").insert({
        ...dataToSave,
        sort_order: nextOrder,
      });

      if (error) {
        alert("Error creating: " + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    handleCancel();
    await loadSlides();
    revalidateSite();
  };

  // ============ DELETE ============
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This slide will be deleted.")) return;

    setDeletingId(id);
    const slide = slides.find((s) => s.id === id);

    if (slide?.image_url) {
      await deleteImage(slide.image_url, "slides");
    }

    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      await resequenceAll();
      await loadSlides();
      revalidateSite();
    }
    setDeletingId(null);
  };

  // ============ TOGGLE ============
  const handleToggleActive = async (slide: Slide) => {
    const { error } = await supabase
      .from("slides")
      .update({ is_active: !slide.is_active })
      .eq("id", slide.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      await loadSlides();
      revalidateSite();
    }
  };

  // ============ MOVE ============
  const handleMove = async (slide: Slide, direction: "up" | "down") => {
    if (movingId) return;

    const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sorted.findIndex((s) => s.id === slide.id);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sorted.length - 1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    const newOrder = [...sorted];
    const [moved] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    setMovingId(slide.id);

    try {
      for (let i = 0; i < newOrder.length; i++) {
        await supabase
          .from("slides")
          .update({ sort_order: -(i + 1) })
          .eq("id", newOrder[i].id);
      }
      for (let i = 0; i < newOrder.length; i++) {
        await supabase
          .from("slides")
          .update({ sort_order: i + 1 })
          .eq("id", newOrder[i].id);
      }

      await loadSlides();
      revalidateSite();
    } catch (error) {
      console.error("Move failed:", error);
      alert("Failed to move slide");
      await loadSlides();
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
            Hero Slides
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage home page slider images
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition w-full md:w-auto"
        >
          <svg
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Slide
        </button>
      </div>

      {/* INFO */}
      <div className="mb-4 bg-blue-50 border border-blue-200 px-4 py-3 text-xs md:text-sm text-blue-700">
        <strong>Tip:</strong> Recommended image size <b>1920×1080</b> or larger.
        Order here = order on website slider.
      </div>

      {/* LIST */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          No slides yet. Click &apos;Add Slide&apos; to create your first hero
          slide.
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`bg-white border p-4 transition ${
                movingId === slide.id
                  ? "border-blue-500 opacity-60"
                  : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <div className="w-full md:w-48 h-32 md:h-28 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer">
                  <img
                    src={slide.image_url}
                    alt={slide.title || "Slide"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onClick={() => setPreviewId(slide.id)}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-base">
                      {slide.title || "(No title)"}
                    </h3>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`text-[10px] font-bold uppercase px-2 py-1 ${
                        slide.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {slide.is_active ? "Active" : "Inactive"}
                    </button>
                    <span className="text-xs text-gray-500">
                      Order: {slide.sort_order}
                    </span>
                  </div>

                  {slide.subtitle && (
                    <p className="text-sm text-gray-600 mb-1">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {slide.cta_text && (
                      <span>
                        Button:{" "}
                        <span className="font-semibold text-black">
                          {slide.cta_text}
                        </span>
                      </span>
                    )}
                    {slide.cta_link && (
                      <span>
                        Link:{" "}
                        <span className="font-mono text-black">
                          {slide.cta_link}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(slide, "up")}
                      disabled={movingId === slide.id}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
                      aria-label="Move up"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMove(slide, "down")}
                      disabled={movingId === slide.id}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
                      aria-label="Move down"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleEditClick(slide)}
                      className="h-8 px-3 border border-gray-300 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      disabled={deletingId === slide.id}
                      className="h-8 px-3 border border-red-300 text-[11px] font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === slide.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl my-8">
            <div className="border-b border-gray-200 px-5 md:px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base md:text-lg font-bold uppercase tracking-wide">
                {editingId ? "Edit Slide" : "Add Slide"}
              </h2>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 md:p-6 space-y-5">
              {/* IMAGE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Slide Image <span className="text-red-600">*</span>
                </label>

                {form.image_url ? (
                  <div className="relative border border-gray-200 bg-gray-50">
                    <img
                      src={form.image_url}
                      alt="Slide"
                      className="w-full max-h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                      aria-label="Remove"
                    >
                      <svg
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
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-40 border-2 border-dashed border-gray-300 hover:border-black transition flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-black disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <svg
                            className="animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          <span className="text-xs font-semibold">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="18"
                              height="18"
                              x="3"
                              y="3"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                          <span className="text-xs font-semibold">
                            Click to Upload Slide Image
                          </span>
                          <span className="text-[10px]">
                            1920×1080 recommended • Max 5MB
                          </span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* TITLE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Winter Collection 2026"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              {/* SUBTITLE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  placeholder="e.g. Premium quality, timeless style"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) =>
                      setForm({ ...form, cta_text: e.target.value })
                    }
                    placeholder="e.g. Shop Now"
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={form.cta_link}
                    onChange={(e) =>
                      setForm({ ...form, cta_link: e.target.value })
                    }
                    placeholder="e.g. /winter-collection"
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                </div>
              </div>

              {/* ACTIVE */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Active (show on website)
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 h-11 border border-gray-300 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || !form.image_url}
                  className="flex-1 h-11 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewId && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {slides
              .filter((s) => s.id === previewId)
              .map((slide) => (
                <div key={slide.id} className="bg-white">
                  <img
                    src={slide.image_url}
                    alt={slide.title || "Slide"}
                    className="w-full max-h-[80vh] object-contain"
                  />
                  {slide.title && (
                    <div className="p-4 border-t border-gray-200">
                      <h3 className="font-bold text-lg">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-600">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            <button
              onClick={() => setPreviewId(null)}
              className="absolute -top-10 right-0 w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}