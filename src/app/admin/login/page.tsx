"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <img
              src="/logo.png"
              alt="Drayko"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">
            Drayko Admin
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Sign in to manage your store
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 md:p-8 shadow-xl"
        >
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@drayko.com"
                className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full h-11 px-3 border border-gray-300 text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Drayko Admin Panel
        </p>
      </div>
    </div>
  );
}