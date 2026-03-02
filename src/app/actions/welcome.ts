"use server";

import { markWelcomeSeen } from "@/lib/profile";
import { revalidatePath } from "next/cache";

export async function confirmWelcomeSeen() {
  await markWelcomeSeen();
  revalidatePath("/", "layout");
}
