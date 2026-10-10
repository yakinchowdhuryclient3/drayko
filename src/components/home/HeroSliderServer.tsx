import { getSlides } from "@/lib/queries/slides";
import HeroSliderClient from "./HeroSliderClient";

export default async function HeroSliderServer() {
  const slides = await getSlides();

  // If no slides in DB, don't render
  if (slides.length === 0) {
    return null;
  }

  return <HeroSliderClient slides={slides} />;
}