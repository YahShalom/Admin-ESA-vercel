export function ContactSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Contact us')}</h2>
      <p className="mt-4 text-slate-600">{String(content.body || 'Drop a note and we will get back to you.')}</p>
      <a href={`mailto:${String(content.email || 'hello@example.com')}`} className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white">Email us</a>
    </section>
  )
}
