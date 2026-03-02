"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

export default function AccountForm({ user }: { user: User }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.get("fullName") as string,
        website: formData.get("website") as string,
      },
    });
    if (error) {
      alert("Error updating the data!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          defaultValue={user?.user_metadata.full_name}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          defaultValue={user?.user_metadata.website}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
          {loading ? "Loading ..." : "Update"}
        </button>
      </div>
    </form>
  );
}
