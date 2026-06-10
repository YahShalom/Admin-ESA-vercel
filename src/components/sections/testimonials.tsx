export function TestimonialsSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const items = Array.isArray(content.items) ? content.items : ['“Fast, polished, and easy to extend.”']

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Testimonials</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'What clients say')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item: any, index: number) => (
          <article key={`${item}-${index}`} className="rounded-2xl border bg-slate-50 p-5 text-slate-700">{String(typeof item === 'string' ? item : item?.quote || 'Great experience')}</article>
        ))}
      </div>
    </section>
  )
}
