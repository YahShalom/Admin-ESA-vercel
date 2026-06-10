export function SiteFooter({ tenant }: { tenant: any }) {
  return (
    <footer className="border-t bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
        <p className="text-slate-300">Dynamic site renderer for Admin ESA</p>
      </div>
    </footer>
  )
}
