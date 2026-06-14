"use client";

import { useState } from "react";
import { Check, ChevronDown, Info } from "lucide-react";
import type { Business, Rfp } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { Card, CardHeader, Pill } from "@/components/ui/card";
import { fmtCop, pickLocalized } from "@/lib/utils";

type ProposalWithAgency = {
  id: string;
  agency?: { id: string; name: string } | null;
  scopeEs: string;
  scopeEn: string | null;
  costCents: number;
  weeks: number;
  teamSize: number;
};
type Row = {
  rfp: Rfp;
  business: Business;
  proposals: ProposalWithAgency[];
};

export function AdminPipeline({ rfps, lang }: { rfps: Row[]; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [filter, setFilter] = useState<"all" | "open" | "review" | "awarded">("all");
  const [localRfps, setLocalRfps] = useState(rfps);

  const filtered = filter === "all" ? localRfps : localRfps.filter((r) => r.rfp.status === filter);

  return (
    <Card>
      <CardHeader
        title={t("adm.pipe.t")}
        subtitle={t("adm.pipe.sub")}
        right={
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {(["all", "open", "review", "awarded"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full px-2.5 py-1 border ${filter === k ? "bg-ink text-paper border-ink" : "bg-paper border-line hover:bg-paper-sunken"}`}
              >
                {t(`adm.pipe.${k}`)}
              </button>
            ))}
          </div>
        }
      />
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-ink-subtle">{t("adm.pipe.empty")}</div>
      ) : (
        <div className="divide-y divide-line">
          {filtered.map((r) => (
            <PipelineRow
              key={r.rfp.id}
              row={r}
              t={t}
              lang={lang}
              onAwarded={(agencyName) => {
                setLocalRfps((curr) =>
                  curr.map((x) =>
                    x.rfp.id === r.rfp.id
                      ? { ...x, rfp: { ...x.rfp, status: "awarded", awardedProposalId: x.proposals.find((p) => p.agency?.name === agencyName)?.id ?? null } }
                      : x,
                  ),
                );
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function PipelineRow({
  row: r,
  t,
  lang,
  onAwarded,
}: {
  row: Row;
  t: (k: string) => string;
  lang: Lang;
  onAwarded: (agencyName: string) => void;
}) {
  const status = r.rfp.status;
  return (
    <details className="group">
      <summary className="p-5 flex items-center gap-4 cursor-pointer hover:bg-paper-subtle">
        <div className="w-10 h-10 rounded-xl bg-paper-sunken flex items-center justify-center text-xl shrink-0">
          {r.business.emoji ?? "🌱"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-medium">{r.business.name}</div>
            {status === "open" && <Pill tone="amber">{t("adm.pipe.open")}</Pill>}
            {status === "review" && <Pill tone="blue">{t("adm.pipe.review")}</Pill>}
            {status === "awarded" && (
              <Pill tone="brand">
                <Check className="w-2.5 h-2.5" />
                {t("adm.pipe.awarded")}
              </Pill>
            )}
          </div>
          <div className="text-xs text-ink-muted mt-0.5 truncate">
            {r.business.city} · {(r.rfp.categories as string[]).map((c) => t(`cat.${c}`)).join(" · ")} ·{" "}
            {pickLocalized(r.business, "need", lang)}
          </div>
        </div>
        <div className="text-xs text-ink-muted shrink-0 hidden sm:block">
          {r.proposals.length} {lang === "es" ? "propuestas" : "proposals"}
        </div>
        <ChevronDown className="w-4 h-4 text-ink-faint chev shrink-0" />
      </summary>
      <div className="px-5 pb-5 bg-paper-subtle">
        {status === "review" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-900">
            <Info className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
            {t("adm.pipe.review.help")}
          </div>
        )}
        {status === "awarded" && r.rfp.awardedProposalId && (
          <AwardedBanner row={r} t={t} />
        )}
        {r.proposals.length === 0 ? (
          <div className="text-xs text-ink-subtle py-2">{t("adm.proposal.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {r.proposals.map((p) => (
              <ProposalCard
                key={p.id}
                rfp={r.rfp}
                proposal={p}
                t={t}
                lang={lang}
                onAwarded={onAwarded}
              />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function AwardedBanner({ row: r, t }: { row: Row; t: (k: string) => string }) {
  const winning = r.proposals.find((p) => p.id === r.rfp.awardedProposalId);
  if (!winning?.agency) return null;
  return (
    <div className="bg-brand-soft border border-brand-border rounded-xl p-3 mb-3 text-xs text-brand-ink">
      <Check className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
      {t("adm.pipe.awarded.help")} <strong>{winning.agency.name}</strong>. {t("adm.pipe.awarded.help2")}
    </div>
  );
}

function ProposalCard({
  rfp,
  proposal: p,
  t,
  lang,
  onAwarded,
}: {
  rfp: Rfp;
  proposal: ProposalWithAgency;
  t: (k: string) => string;
  lang: Lang;
  onAwarded: (agencyName: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isAwarded = rfp.status === "awarded" && rfp.awardedProposalId === p.id;
  const canAward = rfp.status === "review";

  async function award() {
    if (busy || !p.agency) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/rfps/${rfp.id}/award`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proposalId: p.id }),
      });
      if (!res.ok) throw new Error();
      onAwarded(p.agency.name);
    } catch {
      alert(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  const scope = lang === "en" && p.scopeEn ? p.scopeEn : p.scopeEs;

  return (
    <div className={`bg-paper border rounded-xl p-4 flex flex-col ${isAwarded ? "border-brand" : "border-line"}`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="font-medium text-sm truncate">{p.agency?.name ?? "—"}</div>
      </div>
      <p className="text-xs text-ink-muted leading-relaxed line-clamp-4 flex-1">{scope}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs border-t border-line pt-3">
        <Stat label={lang === "es" ? "Costo" : "Cost"} value={fmtCop(p.costCents)} />
        <Stat label={lang === "es" ? "Semanas" : "Weeks"} value={p.weeks} />
        <Stat label={lang === "es" ? "Equipo" : "Team"} value={p.teamSize} />
      </div>
      {canAward && (
        <button
          onClick={award}
          disabled={busy}
          className="mt-3 bg-ink text-paper rounded-full text-xs py-1.5 hover:bg-stone-800 disabled:opacity-40"
        >
          {t("adm.award")}
        </button>
      )}
      {isAwarded && (
        <div className="mt-3 text-xs bg-brand-soft text-brand-ink border border-brand-border rounded-full px-3 py-1.5 text-center">
          <Check className="w-3 h-3 inline -mt-0.5" /> {t("adm.awarded.tag")}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-ink-subtle text-[10px] uppercase tracking-wider">{label}</div>
      <div className="font-medium tabular mt-0.5">{value}</div>
    </div>
  );
}
