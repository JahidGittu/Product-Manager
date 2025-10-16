export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-card rounded-2xl p-6 shadow-md animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-9 bg-muted rounded w-20"></div>
            <div className="h-9 bg-muted rounded w-20"></div>
            <div className="h-9 bg-muted rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
