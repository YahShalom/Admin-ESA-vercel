export function PricingSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const plans = Array.isArray(content.plans) ? content.plans : [{ name: 'Starter', price: '$49' }]

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Pricing')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((plan: any, index: number) => (
          <article key={`${plan}-${index}`} className="rounded-2xl border bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">{String(typeof plan === 'string' ? plan : plan?.name || 'Plan')}</h3>
            <p className="mt-2 text-sm text-slate-600">{String(typeof plan === 'string' ? 'Available pricing plan' : plan?.description || 'Ready for your pricing table')}</p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{String(typeof plan === 'string' ? '$0' : plan?.price || '$0')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
