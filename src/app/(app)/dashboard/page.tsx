import { createServerSupabase } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building, Newspaper, Scissors, ShoppingCart } from 'lucide-react'
import { CreateProjectButton } from './create-project-button'

const categories = [
    { name: 'Salon', icon: Scissors },
    { name: 'Barber', icon: Scissors },
    { name: 'Ecommerce', icon: ShoppingCart },
    { name: 'Blog', icon: Newspaper },
]

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: memberships } = await supabase
    .from('tenant_memberships')
    .select('role, tenants(*)')
    .eq('user_id', user.id)

  const tenants = memberships
    ?.map((m) => (m as any).tenants)
    .filter(Boolean) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin ESA Dashboard</h1>
        <p className="text-muted-foreground">
          Select a tenant or create a new project.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {tenants.map((tenant) => tenant && (
                  <Card key={tenant.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {tenant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Slug: {tenant.slug}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/${tenant.slug}`}>Enter</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <h3 className="font-semibold">No tenants found</h3>
                <p className="text-muted-foreground text-center mt-2">You are not associated with any tenants yet. You can create one below.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle>Create a New Project</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {categories.map((category) => (
                    <CreateProjectButton key={category.name} category={category} />
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
