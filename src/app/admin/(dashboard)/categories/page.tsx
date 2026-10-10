"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  const supabase = createClient();

  // ============ HELPER: Re-sequence ALL categories ============
  const resequenceAll = async () => {
    const { data: allCategories } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (allCategories) {
      const updates = allCategories.map((cat: Category, i: number) =>
        supabase
          .from("categories")
          .update({ sort_order: i + 1 })
          .eq("id", cat.id)
      );
      await Promise.all(updates);
    }
  };

  // ============ LOAD CATEGORIES ============
  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading categories:", error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============ SLUG GENERATOR ============
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug:
        prev.slug === generateSlug(prev.name) || !prev.slug
          ? generateSlug(name)
          : prev.slug,
    }));
  };

  // ============ FORM OPEN/CLOSE ============
  const handleAddClick = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (category: Category) => {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      is_active: true,
    });
  };

  // ============ SAVE (CREATE/UPDATE) ============
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      alert("Name and slug are required");
      return;
    }

    setSaving(true);

    if (editingId) {
      // === UPDATE ===
      const { error } = await supabase
        .from("categories")
        .update({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          image_url: form.image_url.trim() || null,
          is_active: form.is_active,
        })
        .eq("id", editingId);

      if (error) {
        alert("Error updating: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      // === CREATE ===
      const nextOrder =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.sort_order)) + 1
          : 1;

      const { error } = await supabase.from("categories").insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        sort_order: nextOrder,
        is_active: form.is_active,
      });

      if (error) {
        alert("Error creating: " + error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    handleCancel();
    await loadCategories();
    revalidateSite();
  };

  // ============ DELETE WITH RE-SEQUENCE ============
  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This category will be deleted. Products in this category will become uncategorized."
      )
    ) {
      return;
    }

    setDeletingId(id);

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
      setDeletingId(null);
      return;
    }

    await resequenceAll();
    await loadCategories();
    revalidateSite();
    setDeletingId(null);
  };

  // ============ TOGGLE ACTIVE ============
  const handleToggleActive = async (category: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      await loadCategories();
      revalidateSite();
    }
  };

  // ============ MOVE UP/DOWN WITH RE-SEQUENCE ============
  const handleMove = async (category: Category, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((c) => c.id === category.id);

    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sorted.length - 1)
    ) {
      return;
    }

    // Swap positions
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newList = [...sorted];
    [newList[index], newList[targetIndex]] = [
      newList[targetIndex],
      newList[index],
    ];

    // Re-sequence ALL sort_orders
    const updates = newList.map((item, i) =>
      supabase
        .from("categories")
        .update({ sort_order: i + 1 })
        .eq("id", item.id)
    );
    await Promise.all(updates);

    await loadCategories();
    revalidateSite();
  };

  return (
    <div className="p-4 md:p-8">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
            Categories
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage product categories
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
          Add Category
        </button>
      </div>

      {/* ============ SEARCH ============ */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full md:w-80 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
        />
      </div>

      {/* ============ LIST ============ */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          {searchQuery
            ? "No categories match your search"
            : "No categories yet. Click 'Add Category' to create one."}
        </div>
      ) : (
        <>
          {/* ============ MOBILE VIEW ============ */}
          <div className="md:hidden space-y-3">
            {filtered.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 p-4"
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {category.slug}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 transition ${
                          category.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </button>
                      <span className="text-xs text-gray-500">
                        Order: {category.sort_order}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleMove(category, "up")}
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition"
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
                    onClick={() => handleMove(category, "down")}
                    className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition"
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
                  <button
                    onClick={() => handleEditClick(category)}
                    className="flex-1 h-9 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="h-9 px-3 border border-red-300 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === category.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ============ DESKTOP VIEW ============ */}
          <div className="hidden md:block bg-white border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Image
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Slug
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMove(category, "up")}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
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
                          <span className="text-xs text-gray-500 w-6 text-center">
                            {category.sort_order}
                          </span>
                          <button
                            onClick={() => handleMove(category, "down")}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition"
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
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`text-[10px] font-bold uppercase px-2 py-1 transition ${
                            category.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={deletingId === category.id}
                            className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800 transition disabled:opacity-50"
                          >
                            {deletingId === category.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============ FORM MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-8 md:my-0">
            <div className="border-b border-gray-200 px-5 md:px-6 py-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold uppercase tracking-wide">
                {editingId ? "Edit Category" : "Add Category"}
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

            <form onSubmit={handleSave} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g. Formal Wears"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Slug <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="e.g. formal-wears"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  URL: /category/{form.slug || "slug"}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  placeholder="/categories/formal-wears.jpg"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition resize-none"
                />
              </div>

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
                  Active (visible on website)
                </label>
              </div>

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
                  disabled={saving}
                  className="flex-1 h-11 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}