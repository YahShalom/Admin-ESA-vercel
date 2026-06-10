"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default function ResetPasswordClient() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Your password has been updated successfully.");
      setError(null);
      // Redirect to login page after a short delay
      setTimeout(() => {
        redirect("/login");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-sm gap-2">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-1.5 mb-4">
          <Label htmlFor="password">New Password</Label>
          <Input required type="password" id="password" name="password" placeholder="Enter your new password" />
        </div>
        <Button type="submit" className="w-full">Update Password</Button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {message && <p className="text-green-500 mt-4">{message}</p>}
      </form>
    </div>
  );
}
