"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const { lang, setLang } = useT();

  function switchLang(l: "es" | "en") {
    if (l === lang) return;
    // 1. Persist the choice for the server (cookie) and the next page load (localStorage).
    document.cookie = `telos.lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // 2. Update client-side context so client components re-render immediately.
    setLang(l);
    // 3. Tell Next to re-fetch Server Components with the new cookie so SSR copy switches too.
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex items-center text-xs border border-line rounded-full overflow-hidden",
        className,
      )}
    >
      <button
        onClick={() => switchLang("es")}
        className={cn(
          "px-2.5 py-1 font-medium",
          lang === "es" ? "bg-paper-sunken text-ink" : "text-ink-muted hover:text-ink",
        )}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        onClick={() => switchLang("en")}
        className={cn(
          "px-2.5 py-1",
          lang === "en" ? "bg-paper-sunken font-medium text-ink" : "text-ink-muted hover:text-ink",
        )}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
    </div>
  );
}
