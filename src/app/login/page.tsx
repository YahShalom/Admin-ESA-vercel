'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { requestMagicLink } from '@/app/actions/auth'
import { AdminEsaMark } from '@/components/brand/AdminEsaMark'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

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
              {origin && <input type="hidden" name="origin" value={origin} />}
            </div>
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          </CardContent>

          {(message || error) && (
            <CardFooter>
              {message && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Check your email</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          )}
        </Card>
      </form>
    </div>
  )
}
