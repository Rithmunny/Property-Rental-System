export default function BrandLogo({ className = 'h-9 w-auto', wordmark = true }) {
  return (
    <span className="flex items-center gap-2">
      <img src="/logo.png" alt="" className={className} />
      {wordmark && <span>PRS</span>}
    </span>
  )
}
