import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function TenantDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Data Management</h1>
        <p className="text-muted-foreground">
          Create, read, update, and delete data for this tenant.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tenant Data</CardTitle>
          <CardDescription>
            This is a placeholder for the tenant data management interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>CRUD operations for your tenant-specific data will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
