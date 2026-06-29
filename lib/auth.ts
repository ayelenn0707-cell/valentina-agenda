import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getConfig, setConfig } from "./db";

export async function initPin(): Promise<void> {
  const hash = await getConfig("pin_hash");
  if (!hash) {
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync("1234", salt);
    await setConfig("pin_hash", hashed);
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = await getConfig("pin_hash");
  if (!hash) return false;
  return bcrypt.compareSync(pin, hash);
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", "1", {
    httpOnly: true,
    path: "/",
    maxAge: 86_400 * 30,
    sameSite: "lax",
  });
}

export async function checkSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value === "1";
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
