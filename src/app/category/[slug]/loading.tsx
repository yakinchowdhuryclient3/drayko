export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 h-16 md:h-20 bg-gray-50" />
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container-custom py-6 md:py-10">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded mt-3 animate-pulse" />
        </div>
      </div>
      <div className="container-custom py-6">
        <div className="h-10 bg-gray-100 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-[3/4] bg-gray-200" />
              <div className="mt-3 h-4 bg-gray-200 rounded" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}