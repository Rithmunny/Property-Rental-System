export default function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/60 text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}
