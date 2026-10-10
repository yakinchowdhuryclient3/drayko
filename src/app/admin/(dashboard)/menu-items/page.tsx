"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

// ============ COLOR OPTIONS ============
const COLOR_OPTIONS = [
  { value: "default", label: "Normal (Black)", dot: "#000000" },
  { value: "red", label: "Red (Sale)", dot: "#dc2626" },
  { value: "pink", label: "Pink (Women's)", dot: "#ec4899" },
  { value: "skyblue", label: "Sky Blue", dot: "#0ea5e9" },
  { value: "green", label: "Green (New)", dot: "#16a34a" },
  { value: "orange", label: "Orange (Trending)", dot: "#ea580c" },
  { value: "purple", label: "Purple (Premium)", dot: "#9333ea" },
  { value: "yellow", label: "Yellow (Highlight)", dot: "#ca8a04" },
  { value: "teal", label: "Teal", dot: "#0d9488" },
  { value: "indigo", label: "Indigo", dot: "#4f46e5" },
];

// ============ COLOR CLASS HELPER ============
export const getMenuColorClasses = (color: string) => {
  const map: Record<string, { text: string; badge: string; dot: string }> = {
    default: {
      text: "hover:text-gray-500",
      badge: "bg-gray-100 text-gray-700",
      dot: "#000000",
    },
    red: {
      text: "text-red-600 hover:text-red-700",
      badge: "bg-red-100 text-red-700",
      dot: "#dc2626",
    },
    pink: {
      text: "text-pink-600 hover:text-pink-700",
      badge: "bg-pink-100 text-pink-700",
      dot: "#ec4899",
    },
    skyblue: {
      text: "text-sky-600 hover:text-sky-700",
      badge: "bg-sky-100 text-sky-700",
      dot: "#0ea5e9",
    },
    green: {
      text: "text-green-600 hover:text-green-700",
      badge: "bg-green-100 text-green-700",
      dot: "#16a34a",
    },
    orange: {
      text: "text-orange-600 hover:text-orange-700",
      badge: "bg-orange-100 text-orange-700",
      dot: "#ea580c",
    },
    purple: {
      text: "text-purple-600 hover:text-purple-700",
      badge: "bg-purple-100 text-purple-700",
      dot: "#9333ea",
    },
    yellow: {
      text: "text-yellow-600 hover:text-yellow-700",
      badge: "bg-yellow-100 text-yellow-700",
      dot: "#ca8a04",
    },
    teal: {
      text: "text-teal-600 hover:text-teal-700",
      badge: "bg-teal-100 text-teal-700",
      dot: "#0d9488",
    },
    indigo: {
      text: "text-indigo-600 hover:text-indigo-700",
      badge: "bg-indigo-100 text-indigo-700",
      dot: "#4f46e5",
    },
  };

  return map[color] || map.default;
};

export default function MenuItemsAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    label: "",
    href: "",
    color: "default",
    is_active: true,
  });

  const supabase = createClient();

  // ============ LOAD ============
  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error loading menu items:", error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============ RESEQUENCE ALL ============
  const resequenceAll = async () => {
    const { data: allItems } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!allItems) return;

    for (let i = 0; i < allItems.length; i++) {
      await supabase
        .from("menu_items")
        .update({ sort_order: -(i + 1) })
        .eq("id", allItems[i].id);
    }

    for (let i = 0; i < allItems.length; i++) {
      await supabase
        .from("menu_items")
        .update({ sort_order: i + 1 })
        .eq("id", allItems[i].id);
    }
  };

  // ============ FORM OPEN/CLOSE ============
  const handleAddClick = () => {
    setForm({
      label: "",
      href: "",
      color: "default",
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setForm({
      label: item.label,
      href: item.href,
      color: item.color,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      label: "",
      href: "",
      color: "default",
      is_active: true,
    });
  };

  // ============ SAVE ============
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.label.trim() || !form.href.trim()) {
      alert("Label and href are required");
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from("menu_items")
        .update({
          label: form.label.trim().toUpperCase(),
          href: form.href.trim(),
          color: form.color,
          is_active: form.is_active,
        })
        .eq("id", editingId);

      if (error) {
        alert("Error updating: " + error.message);
        setSaving(false);
        return;
      }
    } else {
      const nextOrder =
        items.length > 0
          ? Math.max(...items.map((i) => i.sort_order)) + 1
          : 1;

      const { error } = await supabase.from("menu_items").insert({
        label: form.label.trim().toUpperCase(),
        href: form.href.trim(),
        color: form.color,
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
    await loadItems();
    revalidateSite();
  };

  // ============ DELETE ============
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This menu item will be deleted.")) {
      return;
    }

    setDeletingId(id);
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      await resequenceAll();
      await loadItems();
      revalidateSite();
    }
    setDeletingId(null);
  };

  // ============ TOGGLE ACTIVE ============
  const handleToggleActive = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      await loadItems();
      revalidateSite();
    }
  };

  // ============ MOVE UP/DOWN ============
  const handleMove = async (item: MenuItem, direction: "up" | "down") => {
    if (movingId) return;

    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sorted.findIndex((i) => i.id === item.id);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sorted.length - 1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    const newOrder = [...sorted];
    const [movedItem] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    setMovingId(item.id);

    try {
      for (let i = 0; i < newOrder.length; i++) {
        const { error } = await supabase
          .from("menu_items")
          .update({ sort_order: -(i + 1) })
          .eq("id", newOrder[i].id);

        if (error) throw error;
      }

      for (let i = 0; i < newOrder.length; i++) {
        const { error } = await supabase
          .from("menu_items")
          .update({ sort_order: i + 1 })
          .eq("id", newOrder[i].id);

        if (error) throw error;
      }

      await loadItems();
      revalidateSite();
    } catch (error) {
      console.error("Move failed:", error);
      alert("Failed to move item. Check console for details.");
      await loadItems();
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* ============ HEADER ============ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
            Menu Items
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage navbar menu order, colors, and visibility
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
          Add Menu Item
        </button>
      </div>

      {/* ============ SEARCH ============ */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items..."
          className="w-full md:w-80 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
        />
      </div>

      {/* ============ INFO BANNER ============ */}
      <div className="mb-4 bg-blue-50 border border-blue-200 px-4 py-3 text-xs md:text-sm text-blue-700">
        <strong>Tip:</strong> Use ↑ ↓ buttons to change menu order. Changes
        reflect on website immediately.
      </div>

      {/* ============ LIST ============ */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          {searchQuery
            ? "No menu items match your search"
            : "No menu items yet. Click 'Add Menu Item' to create one."}
        </div>
      ) : (
        <>
          {/* ============ MOBILE VIEW ============ */}
          <div className="md:hidden space-y-3">
            {filtered.map((item) => {
              const colorClasses = getMenuColorClasses(item.color);
              return (
                <div
                  key={item.id}
                  className={`bg-white border p-4 transition ${
                    movingId === item.id
                      ? "border-blue-500 opacity-60"
                      : "border-gray-200"
                  }`}
                >
                  <div className="mb-3">
                    <h3
                      className={`font-bold text-sm ${colorClasses.text}`}
                    >
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {item.href}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 transition ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </button>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-1 flex items-center gap-1.5 ${colorClasses.badge}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colorClasses.dot }}
                        />
                        {COLOR_OPTIONS.find((c) => c.value === item.color)
                          ?.label || "Normal"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Order: {item.sort_order}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleMove(item, "up")}
                      disabled={movingId === item.id}
                      className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
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
                      onClick={() => handleMove(item, "down")}
                      disabled={movingId === item.id}
                      className="w-9 h-9 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50"
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
                      onClick={() => handleEditClick(item)}
                      className="flex-1 h-9 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="h-9 px-3 border border-red-300 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deletingId === item.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============ DESKTOP VIEW ============ */}
          <div className="hidden md:block bg-white border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Label
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Link
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Color
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
                  {filtered.map((item) => {
                    const colorClasses = getMenuColorClasses(item.color);
                    const colorOpt = COLOR_OPTIONS.find(
                      (c) => c.value === item.color
                    );
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition ${
                          movingId === item.id ? "opacity-60" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold text-sm ${colorClasses.text}`}
                          >
                            {item.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.href}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 inline-flex items-center gap-1.5 ${colorClasses.badge}`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: colorClasses.dot }}
                            />
                            {colorOpt?.label || "Normal"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMove(item, "up")}
                              disabled={movingId === item.id}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-30"
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
                            <span className="text-xs text-gray-500 w-6 text-center font-bold">
                              {item.sort_order}
                            </span>
                            <button
                              onClick={() => handleMove(item, "down")}
                              disabled={movingId === item.id}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-30"
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
                            onClick={() => handleToggleActive(item)}
                            className={`text-[10px] font-bold uppercase px-2 py-1 transition ${
                              item.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {item.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800 transition disabled:opacity-50"
                            >
                              {deletingId === item.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                {editingId ? "Edit Menu Item" : "Add Menu Item"}
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
                  Label <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) =>
                    setForm({ ...form, label: e.target.value })
                  }
                  required
                  placeholder="e.g. SALE"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Displayed in navbar (will be uppercase)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                  Link (href) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                  required
                  placeholder="e.g. /sale or /category/kurta"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              {/* ============ COLOR PICKER ============ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((opt) => {
                    const colorClasses = getMenuColorClasses(opt.value);
                    const isSelected = form.color === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, color: opt.value })
                        }
                        className={`flex items-center gap-2 px-3 py-2.5 border text-xs font-semibold transition text-left ${
                          isSelected
                            ? "border-black bg-gray-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300"
                          style={{ backgroundColor: opt.dot }}
                        />
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto flex-shrink-0"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Selected: {COLOR_OPTIONS.find((c) => c.value === form.color)?.label}
                </p>
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
                  Active (visible in navbar)
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