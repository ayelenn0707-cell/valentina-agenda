import { initPin } from "@/lib/auth";
import { seedData } from "@/lib/seed";
import { checkSession } from "@/lib/auth";
import { ensureInitialized } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  await ensureInitialized();
  await initPin();
  await seedData();

  const authenticated = await checkSession();

  if (authenticated) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
