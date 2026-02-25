'use client'

import { useState, useTransition, useRef } from 'react'
import type { ElementRef } from 'react'
import { createTenant } from '@/app/actions/tenants'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateProjectButton({ category }: { category: { name: string, icon: React.ElementType } }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<ElementRef<'form'>>(null)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createTenant(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        formRef.current?.reset()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="group relative flex items-center gap-4 p-4 transition-all hover:bg-muted/50 cursor-pointer">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary to-amber-500 opacity-0 transition-all group-hover:opacity-100"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-primary to-amber-500 rounded-lg">
              <category.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">Start from a template</p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          ref={formRef}
          action={handleSubmit}
        >
          <DialogHeader>
            <DialogTitle>Create a new {category.name} project</DialogTitle>
            <DialogDescription>
              Give your new project a name. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                placeholder="My Awesome Project"
                required
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm text-center col-span-4">{error}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isPending}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
