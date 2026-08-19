import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
