import type { ReactElement } from 'react'
import { HeroSection } from '@/components/sections/hero'
import { AboutSection } from '@/components/sections/about'
import { ServicesSection } from '@/components/sections/services'
import { TeamSection } from '@/components/sections/team'
import { BookingSection } from '@/components/sections/booking'
import { ProductsSection } from '@/components/sections/products'
import { GallerySection } from '@/components/sections/gallery'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { ContactSection } from '@/components/sections/contact'
import { FaqSection } from '@/components/sections/faq'
import { PricingSection } from '@/components/sections/pricing'
import { BlogSection } from '@/components/sections/blog'
import { SiteNav } from '@/components/sections/site-nav'
import { SiteFooter } from '@/components/sections/site-footer'

export function SiteRenderer({
  tenant,
  page,
  pages,
  sections,
  path,
}: {
  tenant: { id: string; name: string; slug: string }
  page: any
  pages: any[]
  sections: any[]
  path: string
}) {
  const sectionMap: Record<string, (props: any) => ReactElement> = {
    hero: HeroSection,
    about: AboutSection,
    services: ServicesSection,
    team: TeamSection,
    booking: BookingSection,
    products: ProductsSection,
    gallery: GallerySection,
    testimonials: TestimonialsSection,
    contact: ContactSection,
    faq: FaqSection,
    pricing: PricingSection,
    blog: BlogSection,
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteNav tenant={tenant} page={page} pages={pages} />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        {sections.length === 0 ? (
          <article className="rounded-2xl border border-dashed p-10 text-center text-slate-600">
            No sections have been configured for this page yet.
          </article>
        ) : (
          sections.map((section) => {
            const Component = sectionMap[String(section.type || '').toLowerCase()] || HeroSection
            return <Component key={section.id || section.type} section={section} tenant={tenant} page={page} path={path} />
          })
        )}
      </section>
      <SiteFooter tenant={tenant} />
    </main>
  )
}
