export function FaqSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const items = Array.isArray(content.items) ? content.items : [{ question: 'How does this work?', answer: 'This renderer pulls content from website sections.' }]

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Frequently asked questions')}</h2>
      <div className="mt-6 space-y-4">
        {items.map((item: any, index: number) => (
          <article key={`${item}-${index}`} className="rounded-2xl border bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">{String(typeof item === 'string' ? item : item?.question || 'Question')}</h3>
            <p className="mt-2 text-sm text-slate-600">{String(typeof item === 'string' ? 'Answer coming soon.' : item?.answer || 'Answer coming soon.')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
