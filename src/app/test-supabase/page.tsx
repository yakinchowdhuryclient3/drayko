import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();

  // Try a simple query — will fail until tables created
  const { data, error } = await supabase.from("products").select("*").limit(1);

  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>

      <div className="space-y-4 text-sm">
        <div className="border p-4">
          <p className="font-bold mb-2">Environment Check:</p>
          <p>
            URL:{" "}
            <span className="text-green-600">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
            </span>
          </p>
          <p>
            Publishable Key:{" "}
            <span className="text-green-600">
              {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                ? "✅ Set"
                : "❌ Missing"}
            </span>
          </p>
          <p>
            Service Role Key:{" "}
            <span className="text-green-600">
              {process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing"}
            </span>
          </p>
        </div>

        <div className="border p-4">
          <p className="font-bold mb-2">Query Result:</p>
          {error ? (
            <div className="text-orange-600">
              <p>Expected error (products table not created yet):</p>
              <p className="text-xs mt-1">{error.message}</p>
            </div>
          ) : (
            <p className="text-green-600">✅ Query successful!</p>
          )}
        </div>
      </div>
    </div>
  );
}