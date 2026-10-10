export type Slide = {
  id: string;
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
};

export const slides: Slide[] = [
  {
    id: "1",
    image: "/slides/slide-1.jpg",
    mobileImage: "/slides/slide-1-mobile.jpg",
    title: "Winter Collection 2026",
    subtitle: "Premium quality, timeless style",
    ctaText: "Shop Now",
    ctaLink: "/winter-collection",
  },
  {
    id: "2",
    image: "/slides/slide-2.jpg",
    mobileImage: "/slides/slide-2-mobile.jpg",
    title: "Flat Sale",
    subtitle: "Up to 50% off on selected items",
    ctaText: "Explore Sale",
    ctaLink: "/sale",
  },
  {
    id: "3",
    image: "/slides/slide-3.jpg",
    mobileImage: "/slides/slide-3-mobile.jpg",
    title: "New Arrivals",
    subtitle: "Fresh styles just landed",
    ctaText: "View Collection",
    ctaLink: "/category/formal-wears",
  },
];