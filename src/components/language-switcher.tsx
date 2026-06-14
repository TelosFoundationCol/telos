"use client";

import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div
      className={cn(
        "flex items-center text-xs border border-line rounded-full overflow-hidden",
        className,
      )}
    >
      <button
        onClick={() => switchLang("es", setLang)}
        className={cn(
          "px-2.5 py-1 font-medium",
          lang === "es" ? "bg-paper-sunken text-ink" : "text-ink-muted hover:text-ink",
        )}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        onClick={() => switchLang("en", setLang)}
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

function switchLang(l: "es" | "en", setLang: (l: "es" | "en") => void) {
  setLang(l);
  // Mirror into a cookie so Server Components can pick it up on next nav.
  document.cookie = `telos.lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
