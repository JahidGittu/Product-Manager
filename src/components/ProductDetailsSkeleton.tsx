'use client';

const ProductDetailsSkeleton = () => {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-card rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-12 animate-pulse">
        {/* Image Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-96 bg-gray-300 rounded-2xl"></div>
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="w-24 h-24 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 w-3/4 rounded"></div>
            <div className="h-6 bg-gray-300 w-1/2 rounded"></div>
            <div className="h-6 bg-gray-300 w-1/3 rounded"></div>
            <div className="h-24 bg-gray-300 rounded"></div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Similar Products Skeleton */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="h-8 w-1/3 bg-gray-300 rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-64 bg-gray-300 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
