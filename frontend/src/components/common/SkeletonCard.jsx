export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-muted" />
      <div className="mt-2 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
    </div>
  )
}
