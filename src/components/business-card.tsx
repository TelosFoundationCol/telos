import Link from "next/link";
import type { Business } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtCop, pickLocalized } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  marketing: "bg-pink-50 text-pink-700",
  tech: "bg-blue-50 text-blue-700",
  accounting: "bg-amber-50 text-amber-700",
  legal: "bg-stone-100 text-stone-700",
  export: "bg-emerald-50 text-emerald-700",
};

export function BusinessCard({ business: b, lang }: { business: Business; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const pct = b.goalCents > 0 ? Math.min(100, Math.round((b.raisedCents / b.goalCents) * 100)) : 0;
  const need = pickLocalized(b, "need", lang);
  return (
    <Link
      href={`/negocios/${b.id}`}
      className="group bg-paper border border-line rounded-2xl p-5 hover:border-ink-faint transition cursor-pointer block"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-paper-sunken flex items-center justify-center text-2xl">
          {b.emoji ?? "🌱"}
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${categoryColors[b.category] ?? "bg-paper-sunken text-ink-muted"}`}>
          {t(`cat.${b.category}`)}
        </span>
      </div>
      <div className="font-semibold tracking-tight text-lg">{b.name}</div>
      <div className="text-xs text-ink-muted mt-0.5">{b.city}</div>
      <p className="text-sm text-ink-muted mt-3 line-clamp-2">{need}</p>
      <div className="mt-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="tabular font-medium">{fmtCop(b.raisedCents)}</span>
          <span className="text-ink-subtle tabular">
            {t("biz.of")} {fmtCop(b.goalCents)}
          </span>
        </div>
        <div className="h-1.5 progress-track rounded-full overflow-hidden">
          <div className={`h-full ${pct === 100 ? "bg-brand" : "bg-ink"}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ink-subtle">
          <span>
            {b.donorsCount} {t("biz.donors")}
          </span>
          <span className={`tabular ${pct === 100 ? "text-brand font-medium" : ""}`}>{pct}%</span>
        </div>
      </div>
    </Link>
  );
}
