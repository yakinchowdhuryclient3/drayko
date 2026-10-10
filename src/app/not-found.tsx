import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <TopBar />
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-20">
        <div className="container-custom text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-wider">404</h1>
          <p className="text-lg md:text-2xl font-semibold mt-4 uppercase tracking-wide">
            Page Not Found
          </p>
          <p className="text-sm md:text-base text-gray-500 mt-2 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}