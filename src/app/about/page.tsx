import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export const metadata = {
  title: "About Us - Drayko",
  description: "For Alpha Males, By Alpha Males",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-8 md:py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide">
            About Us
          </h1>
          <p className="text-xs md:text-sm font-semibold tracking-widest uppercase text-gray-500 mt-3">
            For Alpha Males, By Alpha Males
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8 md:mb-10">
            <Image
              src="/logo.png"
              alt="Drayko"
              width={160}
              height={60}
              className="object-contain w-auto h-16 md:h-20"
            />
          </div>

          {/* Main About Text */}
          <p className="text-lg md:text-2xl leading-relaxed text-gray-800 font-light">
            We believe less is more—but never boring. Our collections are built
            around refined essentials and elevated basics, designed to move
            with your lifestyle.{" "}
            <span className="font-semibold text-black">
              Minimalist in form, maximal in impact.
            </span>
          </p>

          {/* Divider */}
          <div className="w-16 h-1 bg-black mx-auto my-8 md:my-12" />

          {/* Brand Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                Quality
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Premium materials and craftsmanship in every piece we create.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                Simplicity
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Refined essentials designed to elevate your everyday style.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
                Confidence
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Made for men who lead with purpose and dress with intention.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}