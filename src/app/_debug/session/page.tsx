import { createServerSupabase } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DebugSessionPage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  const hasSession = session !== null
  const userEmail = session?.user?.email

  const headerList = await headers()
  const host = headerList.get('host')
  const forwardedHost = headerList.get('x-forwarded-host')
  const forwardedProto = headerList.get('x-forwarded-proto')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Auth Debug Probe</CardTitle>
          <CardDescription>
            This page displays the current session status and relevant request headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="font-semibold">Session Details</h3>
            <p>
              <strong>Has Session:</strong>{' '}
              <span className={hasSession ? 'text-green-500' : 'text-red-500'}>
                {hasSession ? '✅ Yes' : '❌ No'}
              </span>
            </p>
            {userEmail && (
              <p>
                <strong>User Email:</strong> {userEmail}
              </p>
            )}
          </div>
          
          <div className="space-y-2 rounded-lg border p-4">
             <h3 className="font-semibold">Request Headers</h3>
            <p>
              <strong>Host:</strong> {host ?? 'N/A'}
            </p>
            <p>
              <strong>X-Forwarded-Host:</strong> {forwardedHost ?? 'N/A'}
            </p>
            <p>
              <strong>X-Forwarded-Proto:</strong> {forwardedProto ?? 'N/A'}
            </p>
          </div>
           <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
