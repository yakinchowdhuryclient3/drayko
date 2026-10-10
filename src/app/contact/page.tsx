"use client";

import { useState } from "react";
import TopBarClientOnly from "@/components/layout/TopBarClientOnly";
import NavbarClientOnly from "@/components/layout/NavbarClientOnly";
import FooterClientOnly from "@/components/layout/FooterClientOnly";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const text = `*New Contact Message from Drayko Website*%0A%0A*Name:* ${encodeURIComponent(
      form.name
    )}%0A*Phone:* ${encodeURIComponent(
      form.phone
    )}%0A*Subject:* ${encodeURIComponent(
      form.subject
    )}%0A%0A*Message:*%0A${encodeURIComponent(form.message)}`;

    window.open(`https://wa.me/8801820563338?text=${text}`, "_blank");

    setSent(true);
    setForm({ name: "", phone: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <main className="min-h-screen bg-white">
      <TopBarClientOnly />
      <NavbarClientOnly />

      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-8 md:py-12 text-center">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wide">
            Contact Us
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-2">
            We&apos;d love to hear from you
          </p>
        </div>
      </div>

      <div className="container-custom py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gray-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">
                    Address
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Barik Building, Agrabad,
                    <br />
                    Chittagong, Bangladesh, 4100
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gray-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">
                    Phone / WhatsApp
                  </h3>
                  <a
                    href="tel:+8801820563338"
                    className="text-sm text-gray-600 hover:text-black transition block"
                  >
                    +880 1820-563338
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Sat – Thu, 10 AM – 9 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gray-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:draykowears@gmail.com"
                    className="text-sm text-gray-600 hover:text-black transition break-all"
                  >
                    draykowears@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-gray-300 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-1">
                    Social
                  </h3>
                  <div className="flex gap-3 mt-2">
                    <a
                      href="https://www.facebook.com/share/19ZoExzP4x/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
                      aria-label="Facebook"
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
                    <a
                      href="https://www.instagram.com/drayko_wears"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
                      aria-label="Instagram"
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
                    <a
                      href="https://wa.me/8801820563338"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white transition"
                      aria-label="WhatsApp"
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
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-wide mb-6">
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Your Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Subject <span className="text-red-600">*</span>
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition bg-white"
                >
                  <option value="">Select a subject</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Return / Exchange">Return / Exchange</option>
                  <option value="Wholesale">Wholesale Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full px-3 py-2.5 border border-gray-300 text-sm focus:outline-none focus:border-black transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition"
              >
                Send via WhatsApp
              </button>

              {sent && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs md:text-sm px-4 py-3">
                  ✓ Your message has been sent via WhatsApp
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <FooterClientOnly />
    </main>
  );
}