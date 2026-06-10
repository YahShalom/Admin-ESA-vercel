export function GallerySection({ section }: { section: any; tenant?: any; page?: any; path?: string }) {
  const content = (section?.content as Record<string, unknown>) || {}
  const images = Array.isArray(content.images) ? content.images : ['https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80']

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Gallery</p>
      <h2 className="mt-3 text-3xl font-semibold text-slate-900">{String(content.title || 'Gallery')}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {images.map((src: any, index: number) => (
          <img key={`${src}-${index}`} src={String(src)} alt="Gallery item" className="h-40 w-full rounded-2xl object-cover" />
        ))}
      </div>
    </section>
  )
}
