export function HeroSection({ section, tenant }: { section: any; tenant: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  return (
    <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-10 text-white shadow-xl">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-200">{tenant.name}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">{String(content.title || 'Welcome to your site')}</h1>
      <p className="mt-4 max-w-2xl text-slate-200">{String(content.subtitle || 'This section is rendered dynamically from website content.')}</p>
    </section>
  )
}
