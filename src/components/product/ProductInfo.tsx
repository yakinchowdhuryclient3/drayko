"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type ColorItem = {
  name: string;
  hex: string;
};

type ProductProp = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  categorySlug: string;
  description?: string;
  sizes?: string[];
  colors?: ColorItem[];
  stock?: number;
  isSale?: boolean;
  isNew?: boolean;
  rating?: number;
  reviews?: number;
  sizeGuideUrl?: string | null;
};

type Props = {
  product: ProductProp;
};

export default function ProductInfo({ product }: Props) {
  const sizes = product.sizes || ["S", "M", "L", "XL", "XXL"];
  const colors =
    product.colors && product.colors.length > 0
      ? product.colors
      : [
          { name: "Black", hex: "#000000" },
          { name: "White", hex: "#ffffff" },
        ];

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { addToCart } = useCart();

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const increaseQty = () => setQuantity((q) => Math.min(q + 1, 10));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: selectedColor,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col">
        {/* Product Name */}
        <h1 className="text-xl md:text-3xl font-bold uppercase tracking-wide mb-3 md:mb-4">
          {product.name}
        </h1>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
          {product.isSale && (
            <span className="bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider">
              Sale
            </span>
          )}
          {product.isNew && !product.isSale && (
            <span className="bg-black text-white text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider">
              New
            </span>
          )}
          {product.stock !== undefined && product.stock > 0 && (
            <span className="bg-green-100 text-green-700 text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider">
              In Stock
            </span>
          )}
          {product.stock !== undefined && product.stock === 0 && (
            <span className="bg-red-100 text-red-700 text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-3 mb-4 md:mb-5 pb-4 border-b border-gray-200">
          <span className="text-2xl md:text-3xl font-bold text-black">
            ৳{product.price.toLocaleString()}
          </span>
          {product.oldPrice && (
            <>
              <span className="text-base md:text-lg text-gray-400 line-through">
                ৳{product.oldPrice.toLocaleString()}
              </span>
              <span className="text-xs md:text-sm font-bold bg-red-600 text-white px-2 py-1">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-5">
          {product.description ||
            `Premium quality ${product.name.toLowerCase()}, crafted with attention to detail.`}
        </p>

        {/* Size Selector */}
        <div className="mb-4 md:mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              Size
            </span>
            {product.sizeGuideUrl && (
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-gray-500 hover:text-black underline flex items-center gap-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
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
                Size Guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[44px] h-10 px-3 text-sm font-semibold border transition ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector — uses hex directly */}
        <div className="mb-4 md:mb-5">
          <div className="mb-2">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
              Color:{" "}
              <span className="text-gray-500 font-normal normal-case">
                {selectedColor}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                aria-label={color.name}
                title={color.name}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 transition ${
                  selectedColor === color.name
                    ? "border-black scale-110"
                    : "border-gray-300 hover:border-black"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-5 md:mb-6">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider block mb-2">
            Quantity
          </span>
          <div className="inline-flex items-center border border-gray-300">
            <button
              onClick={decreaseQty}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Decrease quantity"
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
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="w-12 text-center text-sm font-bold">
              {quantity}
            </span>
            <button
              onClick={increaseQty}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="Increase quantity"
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
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 h-12 border-2 text-sm font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              product.stock === 0
                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                : added
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-black border-black hover:bg-gray-100"
            }`}
          >
            {product.stock === 0
              ? "Out of Stock"
              : added
              ? "✓ Added!"
              : "Add to Cart"}
          </button>
          <button
            disabled={product.stock === 0}
            className="flex-1 h-12 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Ready to Ship</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>7 days easy return policy</span>
          </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {showSizeGuide && product.sizeGuideUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-gray-200 transition shadow-lg"
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
            <img
              src={product.sizeGuideUrl}
              alt="Size Guide"
              className="w-full h-full max-h-[90vh] object-contain bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}