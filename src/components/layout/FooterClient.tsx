"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  data: {
    site_name: string;
    site_tagline: string;
    site_description: string;
    contact_phone: string;
    contact_whatsapp: string;
    contact_email: string;
    contact_address: string;
    social_facebook: string;
    social_instagram: string;
    social_whatsapp: string;
    copyright_text: string;
  };
};

export default function FooterClient({ data }: Props) {
  return (
    <footer className="bg-black text-white mt-10">
      {/* Main Footer — content halka নিচে, black size same */}
      <div className="pt-6 md:pt-10 pb-16 md:pb-22">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {/* Column 1 - Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-2 md:mb-3">
                <Image
                  src="/logo.png"
                  alt={data.site_name}
                  width={120}
                  height={40}
                  className="object-contain w-auto h-8 md:h-10 brightness-0 invert"
                />
              </Link>
              <p className="text-xs md:text-sm font-semibold tracking-wide text-white mb-2 md:mb-3">
                {data.site_tagline}
              </p>
              <p className="text-[11px] md:text-sm text-gray-400 leading-relaxed mb-3 md:mb-4">
                {data.site_description}
              </p>
              <div className="flex items-center gap-2 md:gap-3">
                {/* Facebook */}
                <a
                  href={data.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-gray-700 rounded-full hover:bg-white hover:text-black transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={data.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-gray-700 rounded-full hover:bg-white hover:text-black transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={data.social_whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center border border-gray-700 rounded-full hover:bg-white hover:text-black transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4">
                Quick Links
              </h3>
              <ul className="space-y-1.5 md:space-y-2.5 text-xs md:text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/sale" className="hover:text-white transition">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/winter-collection"
                    className="hover:text-white transition"
                  >
                    Winter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track-order"
                    className="hover:text-white transition"
                  >
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Categories */}
            <div>
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4">
                Categories
              </h3>
              <ul className="space-y-1.5 md:space-y-2.5 text-xs md:text-sm text-gray-400">
                <li>
                  <Link
                    href="/category/formal-wears"
                    className="hover:text-white transition"
                  >
                    Formal Wears
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/kurta"
                    className="hover:text-white transition"
                  >
                    Kurta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/polo"
                    className="hover:text-white transition"
                  >
                    Polo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/womens"
                    className="hover:text-white transition"
                  >
                    Women&apos;s
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/shoes"
                    className="hover:text-white transition"
                  >
                    Shoes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Contact */}
            <div className="col-span-2 lg:col-span-1">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4">
                Contact Info
              </h3>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-400">
                <li className="flex items-start gap-2 md:gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{data.contact_address}</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a
                    href={`tel:${data.contact_phone.replace(/\s/g, "")}`}
                    className="hover:text-white transition"
                  >
                    {data.contact_phone}
                  </a>
                </li>
                <li className="flex items-start gap-2 md:gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <a
                    href={`mailto:${data.contact_email}`}
                    className="hover:text-white transition break-all"
                  >
                    {data.contact_email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-3 text-[11px] md:text-sm text-gray-400 text-center md:text-left">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-semibold">{data.site_name}</span>.{" "}
            {data.copyright_text}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <span className="text-gray-600 hidden md:inline">•</span>
            <Link href="/terms" className="hover:text-white transition">
              Terms &amp; Conditions
            </Link>
            <span className="text-gray-600 hidden md:inline">•</span>
            <Link href="/return-policy" className="hover:text-white transition">
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}