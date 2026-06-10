export function TeamSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const members = Array.isArray(content.members) ? content.members : ['Our team', 'Creative specialists', 'Growth partners']

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Team</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Meet the team')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {members.map((member: any, index: number) => (
          <article key={`${member}-${index}`} className="rounded-2xl border bg-slate-50 p-5">
            <div className="h-12 w-12 rounded-full bg-slate-900" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">{String(typeof member === 'string' ? member : member?.name || 'Team member')}</h3>
            <p className="text-sm text-slate-600">{String(typeof member === 'string' ? 'Team overview' : member?.role || 'Available for your project')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
