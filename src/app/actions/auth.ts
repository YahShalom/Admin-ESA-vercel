"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithEmailAndPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") === "on";
  const supabase = await createServerSupabase({ remember });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  return redirect("/dashboard");
}

export async function signUpWithEmailAndPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createServerSupabase();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return redirect(`/signup?message=${encodeURIComponent(error.message)}`);
  }

  if (data.user && !data.session) {
    return redirect("/login?message=Check email to confirm your account.");
  }

  revalidatePath("/", "layout");
  return redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createServerSupabase();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return redirect(
      `/auth/forgot-password?message=${encodeURIComponent(error.message)}`
    );
  }

  return redirect("/login?message=Password reset email sent. Check your inbox.");
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const supabase = await createServerSupabase();

  if (password !== confirmPassword) {
    return redirect(
      "/auth/update-password?message=Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return redirect(
      `/auth/update-password?message=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/", "layout");
  return redirect("/dashboard");
}


export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return redirect("/login");
}