/**
 * Server-side translation helper for Server Components.
 * Reads the lang cookie set by the LanguageSwitcher; defaults to "es".
 */
import { cookies } from "next/headers";
import { dictionaries, type Lang } from "./dictionaries";

export const LANG_COOKIE = "telos.lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const val = store.get(LANG_COOKIE)?.value;
  return val === "en" ? "en" : "es";
}

export async function getT() {
  const lang = await getLang();
  const dict = dictionaries[lang];
  return {
    lang,
    t: (key: string, fallback?: string) => dict[key] ?? fallback ?? key,
  };
}
