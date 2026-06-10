export function ProductsSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const products = Array.isArray(content.items) ? content.items : ['Starter package', 'Growth package', 'Enterprise package']

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Products</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Featured products')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {products.map((item: any, index: number) => (
          <article key={`${item}-${index}`} className="rounded-2xl border bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">{String(typeof item === 'string' ? item : item?.name || 'Product')}</h3>
            <p className="mt-2 text-sm text-slate-600">{String(typeof item === 'string' ? 'Dynamic product card.' : item?.description || 'Ready for your catalog')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
