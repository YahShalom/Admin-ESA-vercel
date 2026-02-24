import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function TenantAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
        <p className="text-muted-foreground">
          Review metrics and performance for this tenant.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            This is a placeholder for the tenant analytics interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Charts and data visualizations will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
