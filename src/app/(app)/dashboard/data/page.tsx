import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function DataManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Data Management</h1>
        <p className="text-muted-foreground">
          Create, read, update, and delete your application data.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>ESA Data</CardTitle>
          <CardDescription>
            This is a placeholder for the ESA data management interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>CRUD operations for your Supabase-powered data will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
