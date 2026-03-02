import { ensureProfile } from "@/lib/profile";
import { WelcomeModal } from "@/components/WelcomeModal";
import { BrandHeader } from "@/components/brand/BrandHeader";

export default async function HomePage() {
  try {
    const ctx = await ensureProfile();
    const user = ctx?.user ?? null;
    const hasSeen = ctx?.profile?.has_seen_welcome ?? false;

    return (
      <main className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
        {user && <WelcomeModal firstTime={!hasSeen} name="Raphael" />}

        <div className="mx-auto max-w-3xl px-6 py-16">
          <BrandHeader variant="hero" />

          <div className="mt-10 rounded-2xl border border-white/10 bg-[rgb(var(--card))] p-8">
            <p className="text-white/70">
              Your Enterprise SaaS Assistant. We handle the boilerplate so you can
              focus on your product.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="inline-flex rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:opacity-90"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (err: any) {
    console.error("HomePage FAILED:", err);
    console.error("message:", err?.message);
    console.error("stack:", err?.stack);
    console.error("string:", String(err));
    throw err; // rethrow so Next shows the real error page too
  }
}
