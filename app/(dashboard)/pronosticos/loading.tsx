// app/(dashboard)/pronosticos/loading.tsx
export default function PronosticosLoading() {
  return (
    <div className="p-4 md:p-6 pb-24 animate-pulse">
      <div className="h-8 bg-gray-800 rounded-md w-1/2 mb-6"></div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#14161d] border border-gray-800 rounded-2xl p-5 w-full">
            <div className="flex justify-between mb-4">
              <div className="h-3 bg-gray-800 rounded w-1/3"></div>
              <div className="h-3 bg-gray-800 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mb-6"></div>
            <div className="h-2 bg-gray-800 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
