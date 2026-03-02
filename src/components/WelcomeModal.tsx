"use client";

import { useState } from "react";
import { confirmWelcomeSeen } from "@/app/actions/welcome";

export function WelcomeModal({
  firstTime,
  name = "Raphael",
}: {
  firstTime: boolean;
  name?: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const title = firstTime ? `Welcome, ${name}.` : `Welcome Back, ${name}.`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[rgb(var(--card))] p-6 shadow-2xl">
        <h2 className="text-2xl font-bold">
          <span className="text-blue-400">{title.split(",")[0]}</span>
          {title.includes(",") ? (
            <>
              <span className="text-white/90">,</span>{" "}
              <span className="text-amber-400">{title.split(",")[1].trim()}</span>
            </>
          ) : null}
        </h2>

        <p className="mt-3 text-white/70">
          Carai Agency | Caribbean AI Agency
          <br />
          <span className="text-white/50">
            Where Caribbean spirit meets intelligent design.
          </span>
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="flex-1 rounded-lg bg-blue-500 py-3 font-semibold text-white hover:opacity-90"
            onClick={async () => {
              if (firstTime) await confirmWelcomeSeen();
              setOpen(false);
            }}
          >
            Continue
          </button>
          <button
            className="rounded-lg border border-white/10 px-4 py-3 text-white/70 hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
