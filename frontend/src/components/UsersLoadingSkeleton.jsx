function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-slate-100 bg-[#f8faff] p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-slate-200"></div>
            <div className="flex-1">
              <div className="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 rounded bg-slate-100"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;
