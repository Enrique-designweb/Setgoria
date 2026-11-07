// app/(dashboard)/futbol/loading.tsx
export default function FutbolLoading() {
  return (
    <div className="p-4 md:p-6 pb-24 animate-pulse">
      {/* Título Skeleton */}
      <div className="h-8 bg-gray-800 rounded-md w-1/3 mb-6"></div>

      {/* Tarjetas Skeleton */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-set-surface border border-gray-800 rounded-2xl p-5 md:p-6 w-full max-w-2xl">
            <div className="flex justify-between mb-5">
              <div className="h-3 bg-gray-800 rounded w-1/4"></div>
              <div className="h-3 bg-gray-800 rounded w-1/6"></div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <div className="h-6 bg-gray-800 rounded w-1/3"></div>
              <div className="h-4 bg-gray-800 rounded w-8"></div>
              <div className="h-6 bg-gray-800 rounded w-1/3"></div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-2 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-2 bg-gray-800 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
