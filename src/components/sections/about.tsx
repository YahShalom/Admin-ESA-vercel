export function AboutSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  return (
    <section className="grid gap-6 rounded-3xl border bg-white p-8 shadow-sm md:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">About</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'About this brand')}</h2>
        <p className="mt-4 text-slate-600">{String(content.body || 'This content comes from your website section configuration.')}</p>
      </div>
      <div className="rounded-2xl bg-slate-100 p-6 text-slate-700">{String(content.highlight || 'A flexible place for your custom messaging.')}</div>
    </section>
  )
}
