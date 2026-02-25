import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { resolveTenantBySlug } from '@/lib/tenant/resolve'
import { LayoutDashboard, BarChart2, Settings, ArrowLeft, Database, History, CreditCard } from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function TenantLayout({ children, params }: LayoutProps) {
  const { tenantSlug } = await params;
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const tenant = await resolveTenantBySlug(tenantSlug)

  const { error: rlsError, count } = await supabase
    .from('tenant_memberships')
    .select('*', { count: 'exact', head: true })
    .match({ user_id: session.user.id, tenant_id: tenant.id })
    
  if (rlsError || count === 0) {
    redirect('/auth/forbidden')
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="font-bold text-xl tracking-wide px-2">
            <span>{tenant.name}</span>
            <span className="text-primary">.</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Overview">
                <Link href={`/${tenant.slug}`}>
                  <LayoutDashboard />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Data">
                <Link href={`/${tenant.slug}/data`}>
                  <Database />
                  <span>Data</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Analytics">
                <Link href={`/${tenant.slug}/analytics`}>
                  <BarChart2 />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Audit Logs">
                <Link href={`/${tenant.slug}/audit-logs`}>
                  <History />
                  <span>Audit Logs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Billing">
                <Link href={`/${tenant.slug}/billing`}>
                  <CreditCard />
                  <span>Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href={`/${tenant.slug}/settings`}>
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Back to Projects">
                        <Link href="/dashboard">
                            <ArrowLeft />
                            <span>All Projects</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="hidden max-md:flex" />
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">{tenant.name}</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Main Dashboard</Link>
          </Button>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
