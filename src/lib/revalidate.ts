// Call this after any admin save operation to refresh website cache
export async function revalidateSite() {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paths: [
          "/",
          "/sale",
          "/winter-collection",
        ],
      }),
    });
  } catch (error) {
    console.error("Revalidation failed:", error);
  }
}