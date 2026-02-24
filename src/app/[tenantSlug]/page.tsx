import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Activity, Database, Settings, BarChart2 } from 'lucide-react'
import { resolveTenantBySlug } from "@/lib/tenant/resolve"

export default async function TenantHomePage({
  params,
}: {
  params: { tenantSlug: string }
}) {
  const { tenantSlug } = params
  const tenant = await resolveTenantBySlug(tenantSlug)
  
  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {tenant.name} Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome to your tenant dashboard. Here's a summary of your project.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Data Records
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data entered yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No recent activity
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Navigate to key areas of your project.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/${tenant.slug}/data`}>
                <Database className="mr-2 h-4 w-4" />
                Manage Data
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/${tenant.slug}/analytics`}>
                <BarChart2 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/${tenant.slug}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Admin ESA</CardTitle>
            <CardDescription>
              Start building your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is your project's command center. You can manage your data, view analytics, and configure settings from the sidebar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
