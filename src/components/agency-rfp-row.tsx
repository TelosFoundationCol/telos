"use client";

import { useState } from "react";
import { Check, Send, X } from "lucide-react";
import type { Business, Rfp } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { daysUntil, fmtCop, pickLocalized } from "@/lib/utils";
import { Pill } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AgencyRfpRow({
  rfp,
  business,
  alreadyBid,
  lang,
}: {
  rfp: Rfp;
  business: Business;
  alreadyBid: boolean;
  lang: Lang;
}) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [open, setOpen] = useState(false);
  const [bid, setBid] = useState(alreadyBid);
  const days = daysUntil(rfp.deadline);

  return (
    <div className="p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-paper-sunken flex items-center justify-center text-xl shrink-0">
        {business.emoji ?? "🌱"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-medium">{business.name}</div>
          <Pill tone="amber">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-0.5" />
            {days > 1 ? `Cierra en ${days}d` : days === 1 ? "Cierra mañana" : "Cierra hoy"}
          </Pill>
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          {business.city} · {(rfp.categories ?? []).map((c) => t(`cat.${c}`)).join(" · ")}
        </div>
        <p className="text-sm text-ink-muted mt-2">{pickLocalized(business, "need", lang)}</p>
        <div className="text-xs text-ink-subtle mt-2 tabular">
          {t("trans.rfps.budget")}: {fmtCop(rfp.budgetMinCents)}–{fmtCop(rfp.budgetMaxCents)}
        </div>
      </div>
      <div className="shrink-0">
        {bid ? (
          <Pill tone="brand">
            <Check className="w-3 h-3" />
            {t("ap.alreadybid")}
          </Pill>
        ) : (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Send className="w-3.5 h-3.5" />
            {t("ap.bid")}
          </Button>
        )}
      </div>
      {open && !bid && (
        <BidModal
          rfp={rfp}
          business={business}
          lang={lang}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setBid(true);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function BidModal({
  rfp,
  business,
  lang,
  onClose,
  onSubmitted,
}: {
  rfp: Rfp;
  business: Business;
  lang: Lang;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [scope, setScope] = useState("");
  const [cost, setCost] = useState("");
  const [weeks, setWeeks] = useState("");
  const [team, setTeam] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = scope.length >= 20 && Number(cost) > 0 && Number(weeks) > 0 && Number(team) > 0;

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rfps/${rfp.id}/proposals`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scope,
          costCents: Math.round(Number(cost) * 100),
          weeks: Number(weeks),
          team: Number(team),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "submit-failed");
      }
      onSubmitted();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="min-w-0">
            <div className="text-xs text-ink-subtle uppercase tracking-wider">{t("bid.to")}</div>
            <div className="text-xl font-semibold tracking-tight mt-1">{business.name}</div>
            <div className="text-sm text-ink-muted mt-0.5">{pickLocalized(business, "need", lang)}</div>
            <div className="text-xs text-ink-muted mt-1 tabular">
              {t("trans.rfps.budget")}: {fmtCop(rfp.budgetMinCents)}–{fmtCop(rfp.budgetMaxCents)}
            </div>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 mt-4">
          <div>
            <Label>{t("bid.scope")}</Label>
            <Textarea
              rows={4}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder={
                lang === "es"
                  ? "Describe qué entregarías, en qué tiempos, cómo medirías el éxito..."
                  : "Describe what you would deliver, on what timeline, how you'd measure success..."
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>{t("bid.cost")}</Label>
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="tabular text-sm" placeholder="3500000" />
            </div>
            <div>
              <Label>{t("bid.weeks")}</Label>
              <Input type="number" value={weeks} onChange={(e) => setWeeks(e.target.value)} className="tabular text-sm" placeholder="8" />
            </div>
            <div>
              <Label>{t("bid.team")}</Label>
              <Input type="number" value={team} onChange={(e) => setTeam(e.target.value)} className="tabular text-sm" placeholder="3" />
            </div>
          </div>
          <div className="bg-paper-subtle border border-line rounded-xl p-3 text-xs text-ink-muted">
            {t("bid.public")}
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <Button onClick={submit} disabled={!valid || submitting} className="w-full py-3 rounded-xl">
            <Send className="w-4 h-4" />
            <span>{t("bid.submit")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
