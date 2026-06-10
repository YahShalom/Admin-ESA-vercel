"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";

export default function ForgotPasswordClient() {
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const supabase = createBrowserSupabase();
        const { error } = await supabase.auth.resetPasswordForEmail(
            formData.get("email") as string,
            {
                redirectTo: `${location.origin}/auth/callback?next=/account`,
            }
        );
        if (error) {
            setError(error.message);
        } else {
            setMessage("Check your email to continue the password reset process.");
            setError(null);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-sm gap-2">
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-1.5 mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input required type="email" id="email" name="email" placeholder="Enter your email" />
                </div>
                <Button type="submit" className="w-full">Send Reset Link</Button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {message && <p className="text-green-500 mt-4">{message}</p>}
            </form>
        </div>
    );
}
