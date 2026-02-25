import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requestMagicLink } from '@/app/actions/auth'
import { AdminEsaMark } from '@/components/brand/AdminEsaMark'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal } from 'lucide-react'

type SearchParams = {
  message?: string
  error?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('slug')
      .eq('owner_id', session.user.id)
      .maybeSingle()

    if (tenant?.slug) {
      redirect(`/${tenant.slug}/dashboard`)
    } else {
      redirect('/onboarding')
    }
  }

  const sp = await searchParams
  const finalMessage = sp?.message ? decodeURIComponent(sp.message) : null
  const finalError = sp?.error ? decodeURIComponent(sp.error) : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <AdminEsaMark />
        </Link>
      </div>

      <form action={requestMagicLink}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to receive a magic link.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          </CardContent>

          {(finalMessage || finalError) && (
            <CardFooter>
              {finalMessage && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Check your email</AlertTitle>
                  <AlertDescription>{finalMessage}</AlertDescription>
                </Alert>
              )}
              {finalError && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{finalError}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          )}
        </Card>
      </form>
    </div>
  )
}
