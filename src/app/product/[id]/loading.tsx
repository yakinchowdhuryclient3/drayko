export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 h-16 md:h-20 bg-gray-50" />
      <div className="container-custom py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-pulse">
          <div>
            <div className="w-full aspect-[3/4] bg-gray-200" />
            <div className="flex gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-24 bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
            <div className="h-12 bg-gray-200 rounded mt-8" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}