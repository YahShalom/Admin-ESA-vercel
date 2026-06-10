export function SiteNav({ tenant, page, pages }: { tenant: any; page: any; pages: any[] }) {
  return (
    <header className="border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <a href="/" className="text-xl font-semibold tracking-tight text-slate-900">{tenant.name}</a>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          {(pages || []).slice(0, 5).map((entry) => (
            <a key={entry.id} href={`/${entry.slug}`} className="hover:text-slate-900">
              {entry.title || entry.slug}
            </a>
          ))}
          {page ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">Viewing {page.title || page.slug}</span> : null}
        </div>
      </nav>
    </header>
  )
}
