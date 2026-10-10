"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate";
import {
  uploadImage,
  deleteImage,
  validateImage,
} from "@/lib/supabase/storage";

type ColorItem = {
  name: string;
  hex: string;
};

type ProductImage = {
  id?: string;
  image_url: string;
  sort_order: number;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  sizes: string[];
  colors: ColorItem[];
  rating: number;
  reviews_count: number;
  is_sale: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  size_guide_url: string | null;
  category_name?: string;
  image?: string;
  images?: ProductImage[];
};

// ============ COLOR PRESETS ============
const COLOR_PRESETS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
  { name: "Brown", hex: "#92400e" },
  { name: "Beige", hex: "#d4c5a9" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Cream", hex: "#fef3c7" },
  { name: "Gold", hex: "#d4af37" },
  { name: "Olive", hex: "#65a30d" },
  { name: "Charcoal", hex: "#374151" },
  { name: "Tan", hex: "#d2b48c" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Orange", hex: "#f97316" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Indigo", hex: "#4f46e5" },
];

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    price: "",
    old_price: "",
    stock: "0",
    is_sale: false,
    is_new: false,
    is_active: true,
  });

  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");

  // Colors as objects
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sizeGuideUrl, setSizeGuideUrl] = useState<string>("");
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const sizeGuideInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // ============ LOAD ============
  const loadData = async () => {
    setLoading(true);

    const { data: cats } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order");

    setCategories(cats || []);

    const { data: prods, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (name),
        product_images (id, image_url, sort_order)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading products:", error);
    } else {
      const formatted = (prods || []).map((p: any) => ({
        ...p,
        colors: Array.isArray(p.colors) ? p.colors : [],
        category_name: p.categories?.name || "Uncategorized",
        images: (p.product_images || []).sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
        image: p.product_images?.[0]?.image_url || null,
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || p.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      category_id: "",
      price: "",
      old_price: "",
      stock: "0",
      is_sale: false,
      is_new: false,
      is_active: true,
    });
    setSizes([]);
    setColors([]);
    setImages([]);
    setSizeInput("");
    setNewColorName("");
    setNewColorHex("#000000");
    setSizeGuideUrl("");
  };

  const handleAddClick = () => {
    resetForm();
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = async (product: Product) => {
    setForm({
      name: product.name,
      slug: product.slug || "",
      description: product.description || "",
      category_id: product.category_id || "",
      price: String(product.price),
      old_price: product.old_price ? String(product.old_price) : "",
      stock: String(product.stock),
      is_sale: product.is_sale,
      is_new: product.is_new,
      is_active: product.is_active,
    });
    setSizes(product.sizes || []);
    setColors(
      Array.isArray(product.colors)
        ? product.colors.map((c: any) =>
            typeof c === "string" ? { name: c, hex: "#888888" } : c
          )
        : []
    );
    setImages(product.images || []);
    setSizeGuideUrl(product.size_guide_url || "");
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // ============ SIZES ============
  const addSize = () => {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) {
      setSizes([...sizes, s]);
      setSizeInput("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  // ============ COLORS ============
  const addColor = (name: string, hex: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Color name is required");
      return;
    }

    if (
      colors.some(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert("This color is already added");
      return;
    }

    setColors([...colors, { name: trimmedName, hex }]);
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const addPresetColor = (preset: { name: string; hex: string }) => {
    addColor(preset.name, preset.hex);
  };

  const removeColor = (name: string) => {
    setColors(colors.filter((c) => c.name !== name));
  };

  const updateColorHex = (name: string, newHex: string) => {
    setColors(
      colors.map((c) => (c.name === name ? { ...c, hex: newHex } : c))
    );
  };

  // ============ PRODUCT IMAGES ============
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const newImages: ProductImage[] = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const validation = validateImage(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      const { url, error } = await uploadImage(
        file,
        "product-images",
        "products"
      );

      if (error || !url) {
        alert(`Failed to upload ${file.name}: ${error}`);
        continue;
      }

      newImages.push({
        image_url: url,
        sort_order: newImages.length,
      });
    }

    setImages(newImages);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    if (!confirm("Delete this image?")) return;

    const img = images[index];

    if (img.id) {
      await deleteImage(img.image_url, "product-images");
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages.map((img, i) => ({ ...img, sort_order: i })));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];

    setImages(newImages.map((img, i) => ({ ...img, sort_order: i })));
  };

  // ============ SIZE GUIDE ============
  const handleSizeGuideSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingGuide(true);

    if (sizeGuideUrl) {
      await deleteImage(sizeGuideUrl, "product-images");
    }

    const { url, error } = await uploadImage(
      file,
      "product-images",
      "size-guides"
    );

    if (error || !url) {
      alert("Failed to upload: " + error);
      setUploadingGuide(false);
      return;
    }

    setSizeGuideUrl(url);
    setUploadingGuide(false);

    if (sizeGuideInputRef.current) {
      sizeGuideInputRef.current.value = "";
    }
  };

  const removeSizeGuide = async () => {
    if (!confirm("Remove size guide image?")) return;

    if (sizeGuideUrl) {
      await deleteImage(sizeGuideUrl, "product-images");
    }
    setSizeGuideUrl("");
  };

  // ============ SAVE ============
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      alert("Valid price is required");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        stock: Number(form.stock) || 0,
        sizes: sizes,
        colors: colors,
        is_sale: form.is_sale,
        is_new: form.is_new,
        is_active: form.is_active,
        size_guide_url: sizeGuideUrl || null,
      };

      let productId: string;

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) throw error;
        productId = editingId;

        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", editingId);
      } else {
        const { data: newProd, error } = await supabase
          .from("products")
          .insert({ ...productData, sort_order: 0 })
          .select("id")
          .single();

        if (error) throw error;
        productId = newProd.id;
      }

      if (images.length > 0) {
        const imageInserts = images.map((img, i) => ({
          product_id: productId,
          image_url: img.image_url,
          sort_order: i,
        }));

        const { error: imgError } = await supabase
          .from("product_images")
          .insert(imageInserts);

        if (imgError) {
          console.error("Image insert error:", imgError);
        }
      }

      setSaving(false);
      handleCancel();
      await loadData();
      revalidateSite();
    } catch (error) {
      console.error("Save error:", error);
      alert(
        "Failed to save product: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setSaving(false);
    }
  };

  // ============ DELETE ============
  const handleDelete = async (id: string) => {
    if (
      !confirm("Are you sure? This product and all its images will be deleted.")
    )
      return;

    setDeletingId(id);

    try {
      const product = products.find((p) => p.id === id);

      const { data: imgs } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id);

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      if (imgs) {
        for (const img of imgs) {
          await deleteImage(img.image_url, "product-images");
        }
      }

      if (product?.size_guide_url) {
        await deleteImage(product.size_guide_url, "product-images");
      }

      await loadData();
      revalidateSite();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleField = async (
    product: Product,
    field: "is_active" | "is_sale" | "is_new"
  ) => {
    const { error } = await supabase
      .from("products")
      .update({ [field]: !product[field] })
      .eq("id", product.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      await loadData();
      revalidateSite();
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide">
            Products
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Manage your product catalog
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
          Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white md:w-64"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-8 text-center text-gray-500">
          {searchQuery || filterCategory !== "all"
            ? "No products match your filters"
            : "No products yet. Click 'Add Product' to create one."}
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-3">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 p-4"
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {product.category_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-sm font-bold">
                        ৳{product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </span>
                      {product.size_guide_url && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 uppercase">
                          Size Guide
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => toggleField(product, "is_active")}
                    className={`text-[10px] font-bold uppercase px-2 py-1 ${
                      product.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => toggleField(product, "is_sale")}
                    className={`text-[10px] font-bold uppercase px-2 py-1 ${
                      product.is_sale
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    Sale
                  </button>
                  <button
                    onClick={() => toggleField(product, "is_new")}
                    className={`text-[10px] font-bold uppercase px-2 py-1 ${
                      product.is_new
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    New
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="flex-1 h-9 border border-gray-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="h-9 px-3 border border-red-300 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deletingId === product.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW */}
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
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Badges
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-gray-100 border border-gray-200 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {product.name}
                          </span>
                          {product.size_guide_url && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 uppercase">
                              Size Guide
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {product.category_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            ৳{product.price.toLocaleString()}
                          </span>
                          {product.old_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{product.old_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold ${
                            product.stock > 0
                              ? product.stock < 5
                                ? "text-orange-600"
                                : "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleField(product, "is_active")}
                            className={`text-[9px] font-bold uppercase px-2 py-1 ${
                              product.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {product.is_active ? "On" : "Off"}
                          </button>
                          <button
                            onClick={() => toggleField(product, "is_sale")}
                            className={`text-[9px] font-bold uppercase px-2 py-1 ${
                              product.is_sale
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            Sale
                          </button>
                          <button
                            onClick={() => toggleField(product, "is_new")}
                            className={`text-[9px] font-bold uppercase px-2 py-1 ${
                              product.is_new
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            New
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800 transition disabled:opacity-50"
                          >
                            {deletingId === product.id ? "..." : "Delete"}
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

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8">
            <div className="border-b border-gray-200 px-5 md:px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-base md:text-lg font-bold uppercase tracking-wide">
                {editingId ? "Edit Product" : "Add Product"}
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
              {/* BASIC INFO */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Product Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="e.g. Premium Woolen Coat"
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    placeholder="auto-generated"
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Product description..."
                    className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition resize-none"
                  />
                </div>
              </div>

              {/* PRICING */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Pricing & Stock
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Price (৳) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                      Old Price (৳)
                    </label>
                    <input
                      type="number"
                      value={form.old_price}
                      onChange={(e) =>
                        setForm({ ...form, old_price: e.target.value })
                      }
                      min="0"
                      step="1"
                      placeholder="optional"
                      className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    min="0"
                    step="1"
                    className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                </div>
              </div>

              {/* PRODUCT IMAGES */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Product Images
                </h3>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative aspect-[3/4] border border-gray-200 overflow-hidden group"
                      >
                        <img
                          src={img.image_url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(index, "up")}
                            disabled={index === 0}
                            className="w-7 h-7 bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                            type="button"
                            onClick={() => moveImage(index, "down")}
                            disabled={index === images.length - 1}
                            className="w-7 h-7 bg-white text-black flex items-center justify-center hover:bg-gray-200 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                            type="button"
                            onClick={() => removeImage(index)}
                            className="w-7 h-7 bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                            aria-label="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-black transition flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-black disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg
                          className="animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
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
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-xs font-semibold">
                          Click to Upload Images
                        </span>
                        <span className="text-[10px]">
                          JPG, PNG, WebP • Max 5MB each
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ⭐ SIZE GUIDE SECTION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Size Guide (Optional)
                </h3>

                <p className="text-[11px] text-gray-500">
                  Upload a size chart image. It will appear as &quot;Size
                  Guide&quot; link on the product page.
                </p>

                {sizeGuideUrl ? (
                  <div className="relative border border-gray-200 p-2 bg-gray-50">
                    <img
                      src={sizeGuideUrl}
                      alt="Size Guide"
                      className="w-full max-h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeSizeGuide}
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
                      ref={sizeGuideInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleSizeGuideSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => sizeGuideInputRef.current?.click()}
                      disabled={uploadingGuide}
                      className="w-full h-20 border-2 border-dashed border-purple-300 hover:border-purple-500 transition flex flex-col items-center justify-center gap-1.5 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                    >
                      {uploadingGuide ? (
                        <>
                          <svg
                            className="animate-spin"
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
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
                            <path d="m14.5 12.5 2-2" />
                            <path d="m11.5 9.5 2-2" />
                            <path d="m8.5 6.5 2-2" />
                            <path d="m17.5 15.5 2-2" />
                          </svg>
                          <span className="text-xs font-semibold">
                            Click to Upload Size Guide Image
                          </span>
                          <span className="text-[10px]">
                            JPG, PNG, WebP • Max 5MB
                          </span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* SIZES */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Sizes
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSize();
                      }
                    }}
                    placeholder="e.g. S, M, L, XL"
                    className="flex-1 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="h-10 px-4 bg-gray-100 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition"
                  >
                    Add
                  </button>
                </div>

                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 text-xs font-bold"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
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
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ⭐ COLORS — NEW SECTION */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Colors
                </h3>

                {/* ADD NEW COLOR */}
                <div className="border border-gray-200 p-3 bg-gray-50">
                  <p className="text-[11px] text-gray-600 mb-2 font-semibold">
                    Add a new color:
                  </p>
                  <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Color name (e.g. Yellow)"
                      className="flex-1 h-10 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addColor(newColorName, newColorHex);
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-12 h-10 border border-gray-300 cursor-pointer"
                        aria-label="Pick color"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        placeholder="#000000"
                        className="w-24 h-10 px-2 border border-gray-300 text-xs font-mono focus:outline-none focus:border-black transition"
                      />
                      <button
                        type="button"
                        onClick={() => addColor(newColorName, newColorHex)}
                        className="h-10 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* PRESETS */}
                  <p className="text-[11px] text-gray-500 mb-2">
                    Quick add from presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((preset) => {
                      const isAdded = colors.some(
                        (c) =>
                          c.name.toLowerCase() === preset.name.toLowerCase()
                      );
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => addPresetColor(preset)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] font-semibold transition ${
                            isAdded
                              ? "border-gray-200 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 hover:border-black text-gray-700"
                          }`}
                          title={
                            isAdded ? "Already added" : `Add ${preset.name}`
                          }
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          {preset.name}
                          {isAdded && " ✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTED COLORS */}
                {colors.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-600 font-semibold mb-2">
                      Selected colors ({colors.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <div
                          key={color.name}
                          className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1.5 border border-gray-200"
                        >
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) =>
                              updateColorHex(color.name, e.target.value)
                            }
                            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                            aria-label={`Change ${color.name} color`}
                          />
                          <span className="text-xs font-bold">
                            {color.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeColor(color.name)}
                            className="text-gray-500 hover:text-red-600 ml-1"
                            aria-label={`Remove ${color.name}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
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
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* BADGES */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
                  Badges & Status
                </h3>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">
                      Active (visible on website)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_sale}
                      onChange={(e) =>
                        setForm({ ...form, is_sale: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">
                      On Sale (shows red Sale badge)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_new}
                      onChange={(e) =>
                        setForm({ ...form, is_new: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">
                      New Arrival (shows black New badge)
                    </span>
                  </label>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 h-11 border border-gray-300 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || uploadingGuide}
                  className="flex-1 h-11 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}