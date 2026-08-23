export default function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </div>
      <div className="h-6 w-16 rounded-full bg-muted" />
    </div>
  )
}
