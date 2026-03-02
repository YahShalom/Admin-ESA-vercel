import { createServerSupabase } from "@/lib/supabase/server";

export async function ensureProfile() {
  try {
    const supabase = await createServerSupabase();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ensure row exists (NO email duplication)
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id" });

    if (upsertError) {
        console.error("ensureProfile upsert error:", upsertError);
        throw upsertError;
    }

    const { data: profile, error: selectError } = await supabase
      .from("profiles")
      .select("has_seen_welcome")
      .eq("id", user.id)
      .single();

    if (selectError) {
        console.error("ensureProfile select error:", selectError);
        throw selectError;
    }

    return { user, profile };
  } catch (err: any) {
    console.error("ensureProfile FAILED:", err);
    console.error("message:", err?.message);
    console.error("stack:", err?.stack);
    console.error("string:", String(err));
    throw err; // rethrow so Next shows the real error page too
  }
}

export async function markWelcomeSeen() {
    try {
        const supabase = await createServerSupabase();

        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update({ has_seen_welcome: true })
            .eq("id", user.id);

        if (error) {
            console.error("markWelcomeSeen error:", error);
            throw error;
        }
    } catch (err: any) {
        console.error("markWelcomeSeen outer error:", err);
        console.error("message:", err?.message);
        console.error("stack:", err?.stack);
        console.error("string:", String(err));
    }
}
