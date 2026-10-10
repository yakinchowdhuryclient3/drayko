"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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
};

type Props = {
  slides: Slide[];
};

export default function HeroSliderClient({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-play
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  // Touch handlers for mobile swipe
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

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image */}
            <img
              src={slide.image_url}
              alt={slide.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  const existing = parent.querySelector(".fallback-bg");
                  if (!existing) {
                    const fallback = document.createElement("div");
                    fallback.className =
                      "fallback-bg w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white text-2xl font-bold";
                    fallback.textContent =
                      slide.title || `Slide ${index + 1}`;
                    parent.appendChild(fallback);
                  }
                }
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Text Content */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="container-custom text-center text-white">
                {slide.title && (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide mb-3 md:mb-4">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                )}
                {slide.cta_text && slide.cta_link && (
                  <Link
                    href={slide.cta_link}
                    className="inline-block bg-white text-black px-6 md:px-8 py-3 md:py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white border-2 border-white transition-colors duration-300"
                  >
                    {slide.cta_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow (Desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center bg-white/80 hover:bg-white rounded-full transition shadow-md"
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

          <button
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 items-center justify-center bg-white/80 hover:bg-white rounded-full transition shadow-md"
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
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === current
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}