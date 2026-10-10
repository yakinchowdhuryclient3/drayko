"use client";

import { useState, useRef } from "react";

type Props = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [isZoomed, setIsZoomed] = useState(false);

  // Touch swipe
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  const goToPrev = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  // ============ TOUCH HANDLERS (Mobile Swipe) ============
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipe = 50;

    if (distance > minSwipe) {
      goToNext();
    } else if (distance < -minSwipe) {
      goToPrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const mainImage = images[activeIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {/* ============ MAIN IMAGE ============ */}
      <div
        className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100 border border-gray-200 group select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {imgErrors[activeIndex] ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 text-gray-400 text-sm font-semibold uppercase text-center p-4">
            {name}
          </div>
        ) : (
          <img
            src={mainImage}
            alt={`${name} - Image ${activeIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? "scale-110" : "scale-100"
            }`}
            onError={() => handleError(activeIndex)}
            draggable={false}
          />
        )}

        {/* ============ LEFT ARROW (Desktop) ============ */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous image"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* ============ RIGHT ARROW (Desktop) ============ */}
        {hasMultipleImages && (
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next image"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* ============ IMAGE COUNTER (Top Right) ============ */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-[10px] md:text-xs font-bold px-2 py-1">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* ============ DOTS INDICATOR (Bottom) ============ */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============ THUMBNAILS ============ */}
      {hasMultipleImages && (
        <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden border-2 transition ${
                index === activeIndex
                  ? "border-black"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              {imgErrors[index] ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                  No img
                </div>
              ) : (
                <img
                  src={img}
                  alt={`${name} ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleError(index)}
                  draggable={false}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}