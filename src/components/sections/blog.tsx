export function BlogSection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const posts = Array.isArray(content.posts) ? content.posts : [{ title: 'Latest article', excerpt: 'This can be replaced with your real blog content.' }]

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Blog</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'From the blog')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {posts.map((post: any, index: number) => (
          <article key={`${post}-${index}`} className="rounded-2xl border bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">{String(typeof post === 'string' ? post : post?.title || 'Article')}</h3>
            <p className="mt-2 text-sm text-slate-600">{String(typeof post === 'string' ? 'Article excerpt' : post?.excerpt || 'Dynamic blog copy')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
