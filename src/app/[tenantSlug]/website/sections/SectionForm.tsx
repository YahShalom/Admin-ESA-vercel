'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { upsertSection } from '@/app/actions/website'

export default function SectionForm({
  tenantSlug,
  selectedPageId,
}: {
  tenantSlug: string
  selectedPageId: string
}) {
  const [type, setType] = useState('hero')
  const [content, setContent] = useState('{}')
  const [sortOrder, setSortOrder] = useState('0')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add section</CardTitle>
        <CardDescription>Attach a new section to the currently selected page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData: FormData) => {
            const rawContent = String(formData.get('content') || '{}')
            let parsedContent: Record<string, unknown> = {}

            try {
              parsedContent = JSON.parse(rawContent)
            } catch {
              parsedContent = {}
            }

            await upsertSection(tenantSlug, {
              page_id: String(formData.get('page_id') || selectedPageId),
              type: String(formData.get('type') || type),
              content: parsedContent,
              sort_order: Number(formData.get('sort_order') || sortOrder || 0),
              is_visible: true,
            })
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <input type="hidden" name="page_id" value={selectedPageId} />
          <input type="hidden" name="type" value={type} />

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="type-select">Section type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type-select" className="w-full">
                <SelectValue placeholder="Choose a section type" />
              </SelectTrigger>
              <SelectContent>
                {['hero', 'about', 'services', 'gallery', 'contact', 'blog'].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="content">Content JSON</Label>
            <Textarea
              id="content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="{}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </div>

          <div className="flex items-end md:col-span-2">
            <Button type="submit">Add section</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
