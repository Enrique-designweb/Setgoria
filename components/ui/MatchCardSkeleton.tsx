export default function MatchCardSkeleton() {
  return (
    <div className="bg-set-surface border border-gray-800 rounded-2xl p-4 w-full animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 bg-gray-700 rounded w-1/3"></div>
        <div className="h-4 bg-gray-700 rounded w-8"></div>
        <div className="h-5 bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="h-10 bg-gray-700 rounded-lg w-full mb-2"></div>
      <div className="h-10 bg-gray-700 rounded-lg w-full"></div>
    </div>
  );
}
