import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className merger. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format COP cents to a short display string. */
export function fmtCop(cents: number): string {
  const cop = Math.round(cents / 100); // cents → COP whole
  if (cop >= 1_000_000) return `COP ${(cop / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (cop >= 1_000) return `COP ${(cop / 1_000).toFixed(0)}K`;
  return `COP ${cop}`;
}

/** Format USD cents. */
export function fmtUsd(cents: number): string {
  return `USD $${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** Auto-format by currency stored on the record. */
export function fmtMoney(
  amountCents: number | null | undefined,
  currency: "USD" | "COP" | "USDC" | null | undefined,
): string {
  if (amountCents == null) return "—";
  if (currency === "USD" || currency === "USDC") return fmtUsd(amountCents);
  return fmtCop(amountCents);
}

/** Generate a public-facing donation reference (TX-2026-XXXXXX). */
export function genReference(prefix = "TX"): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 999_999)
    .toString()
    .padStart(6, "0");
  return `${prefix}-${year}-${rand}`;
}

/** YYYY-MM-DD for daily rate-limiting / vote uniqueness. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Days remaining (negative if past). */
export function daysUntil(d: Date | string): number {
  const target = typeof d === "string" ? new Date(d) : d;
  const ms = target.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Days since (positive for past). */
export function daysSince(d: Date | string): number {
  const target = typeof d === "string" ? new Date(d) : d;
  const ms = Date.now() - target.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Safe pick of localized field {fooEs, fooEn}. */
export function pickLocalized<T extends Record<string, unknown>>(
  obj: T,
  base: string,
  lang: "es" | "en",
): string {
  const key = lang === "en" ? `${base}En` : `${base}Es`;
  const val = (obj as Record<string, unknown>)[key];
  if (typeof val === "string" && val.length > 0) return val;
  // fallback to the other language if missing
  const otherKey = lang === "en" ? `${base}Es` : `${base}En`;
  const other = (obj as Record<string, unknown>)[otherKey];
  return typeof other === "string" ? other : "";
}

export function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  return crypto.subtle.digest("SHA-256", data).then((buf) => {
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });
}
