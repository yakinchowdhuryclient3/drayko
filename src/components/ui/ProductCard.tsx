"use client";

import Link from "next/link";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  old_price?: number | null;
  oldPrice?: number | null;
  image?: string;
  images?: string[];
  is_sale?: boolean;
  isSale?: boolean;
  is_new?: boolean;
  isNew?: boolean;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const [imgError, setImgError] = useState(false);

  // Handle both DB and static data field names
  const oldPrice = product.old_price ?? product.oldPrice;
  const isSale = product.is_sale ?? product.isSale;
  const isNew = product.is_new ?? product.isNew;
  const image = product.image || product.images?.[0] || "/placeholder.jpg";

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 border border-gray-200">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-400 text-xs font-semibold uppercase text-center p-2">
            {product.name}
          </div>
        ) : (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}

        {/* Sale Badge */}
        {isSale && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            Sale
          </span>
        )}

        {/* New Badge */}
        {isNew && !isSale && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            New
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-gray-600 transition">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-black">
            ৳{product.price.toLocaleString()}
          </span>
          {oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              ৳{oldPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}