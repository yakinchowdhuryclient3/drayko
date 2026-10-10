import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Return & Refund Policy - Drayko",
  description: "Return and Refund Policy of Drayko",
};

// 🔧 CLIENT CONTENT — এখানে client এর content paste করবি
const content = `
Return & Refund Policy content will be updated soon.

Currently, we offer 7 days easy return policy for unused products with original packaging.

For return requests, contact us at draykowears@gmail.com or +880 1820-563338.
`;

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Navbar />

      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-8 md:py-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            Return &amp; Refund Policy
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            Easy returns within 7 days
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          {content
            .trim()
            .split("\n\n")
            .map((paragraph, index) => (
              <p
                key={index}
                className="text-sm md:text-base text-gray-700 leading-relaxed mb-4"
              >
                {paragraph.trim()}
              </p>
            ))}

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400 italic">
              Content will be updated soon by Drayko team
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}