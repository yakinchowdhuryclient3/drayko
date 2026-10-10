"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/data/categories";

type Props = {
  category: Category;
};

export default function CategoryCard({ category }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center"
    >
      <div className="w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-200 group-hover:border-black transition-all duration-300 flex items-center justify-center">
        {imgError ? (
          <span className="text-2xl md:text-3xl font-bold text-gray-400 uppercase">
            {category.name.charAt(0)}
          </span>
        ) : (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h3 className="mt-3 text-[11px] md:text-sm font-semibold text-center uppercase tracking-wide group-hover:text-gray-600 transition leading-tight">
        {category.name}
      </h3>
    </Link>
  );
}