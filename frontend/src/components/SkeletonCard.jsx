/* SkeletonCard — Premium Equestrian theme, supports layout="grid" (default) | layout="list" */
export default function SkeletonCard({ layout = 'grid' }) {
  if (layout === 'list') {
    return (
      <div className="rounded-sm overflow-hidden animate-pulse equestrian-card">
        <div className="flex items-stretch gap-4 p-4">
          {/* Image Skeleton */}
          <div className="flex-shrink-0 w-28 h-28 rounded-sm" style={{ background: "#5B1E28" }} />
          
          {/* Content Skeleton */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 rounded-sm w-14" style={{ background: "#5B1E28" }} />
              <div className="h-3 rounded-sm w-20" style={{ background: "#5B1E28" }} />
            </div>
            <div className="h-4 rounded-sm w-3/4 mb-2" style={{ background: "#5B1E28" }} />
            <div className="h-3 rounded-sm w-1/2 mb-3" style={{ background: "#5B1E28" }} />
            <div className="flex gap-2 mb-3">
              <div className="h-3 rounded-sm w-16" style={{ background: "#5B1E28" }} />
              <div className="h-3 rounded-sm w-12" style={{ background: "#5B1E28" }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 rounded-sm w-20" style={{ background: "#5B1E28" }} />
              <div className="h-4 rounded-sm w-14" style={{ background: "#5B1E28" }} />
              <div className="h-4 rounded-sm w-12 ml-auto" style={{ background: "#5B1E28" }} />
            </div>
          </div>
          
          {/* Actions Skeleton */}
          <div className="flex-shrink-0 flex flex-col items-center justify-between gap-2 pl-2 py-1">
            <div className="w-8 h-8 rounded-sm" style={{ background: "#5B1E28" }} />
            <div className="h-8 rounded-sm w-16" style={{ background: "#5B1E28" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-sm overflow-hidden animate-pulse equestrian-card h-full flex flex-col">
      {/* Image Skeleton */}
      <div className="aspect-square" style={{ background: "#5B1E28" }} />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="h-2 rounded-sm w-1/3" style={{ background: "#5B1E28" }} />
        <div className="h-4 rounded-sm w-3/4" style={{ background: "#5B1E28" }} />
        <div className="h-4 rounded-sm w-2/3" style={{ background: "#5B1E28" }} />
        <div className="flex gap-2 mt-auto">
          <div className="h-3 rounded-sm w-16" style={{ background: "#5B1E28" }} />
          <div className="h-3 rounded-sm w-12" style={{ background: "#5B1E28" }} />
        </div>
        <div className="h-5 rounded-sm w-1/2" style={{ background: "#5B1E28" }} />
      </div>
      
      {/* Button Skeleton */}
      <div className="px-4 pb-4">
        <div className="h-10 rounded-sm" style={{ background: "rgba(216, 199, 174, 0.2)" }} />
      </div>
    </div>
  )
}
