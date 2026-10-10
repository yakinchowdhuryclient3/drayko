import { getSlides } from "@/lib/queries/slides";
import HeroSliderClient from "./HeroSliderClient";

export const revalidate = 300;

export default async function HeroSliderServer() {
  const slides = await getSlides();

  if (slides.length === 0) {
    return null;
  }

  return <HeroSliderClient slides={slides} />;
}