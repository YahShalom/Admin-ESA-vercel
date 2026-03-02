import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/profile";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await ensureProfile();

  if (!data?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
