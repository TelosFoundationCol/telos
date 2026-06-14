import type { Rfp, Business } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtCop, daysUntil, pickLocalized } from "@/lib/utils";
import { Pill } from "@/components/ui/card";

type ProposalWithAgency = {
  id: string;
  agency?: { id: string; name: string } | null;
  costCents: number;
  weeks: number;
  teamSize: number;
};

export function PublicRfpCard({
  rfp,
  business,
  proposals,
  lang,
}: {
  rfp: Rfp;
  business: Business;
  proposals: ProposalWithAgency[];
  lang: Lang;
}) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const days = daysUntil(rfp.deadline);
  const isOpen = rfp.status === "open";
  return (
    <div className="p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-paper-sunken flex items-center justify-center text-xl shrink-0">
        {business.emoji ?? "🌱"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium">{business.name}</div>
          {isOpen ? (
            <Pill tone="amber">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-0.5" />
              {days > 1 ? `Cierra en ${days}d` : days === 1 ? "Cierra mañana" : "Cierra hoy"}
            </Pill>
          ) : (
            <Pill tone="blue">{t("post.review")}</Pill>
          )}
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          {business.city} · {(rfp.categories ?? []).map((c) => t(`cat.${c}`)).join(" · ")}
        </div>
        <p className="text-sm text-ink-muted mt-2">{pickLocalized(business, "need", lang)}</p>
        <div className="text-xs text-ink-subtle mt-2 tabular">
          {t("trans.rfps.budget")}: {fmtCop(rfp.budgetMinCents)}–{fmtCop(rfp.budgetMaxCents)}
        </div>
        {proposals.length === 0 ? (
          <div className="mt-3 text-xs text-ink-subtle italic">{t("trans.rfps.noyet")}</div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {proposals.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 text-[11px] bg-paper-sunken border border-line text-ink-muted rounded-full px-2 py-0.5"
              >
                {p.agency?.name ?? "—"} · <span className="tabular">{fmtCop(p.costCents)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
