"use client";

import { useState } from "react";
import { Check, ChevronDown, MapPin, PlayCircle, X } from "lucide-react";
import type { Postulado } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { pickLocalized } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminPostuladoRow({ postulado: p, lang }: { postulado: Postulado; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [status, setStatus] = useState<"pending_review" | "approved" | "rejected" | "funded">(p.status);
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/postulados/${p.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setStatus(action === "approve" ? "approved" : "rejected");
    } catch {
      alert(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  if (status !== "pending_review") {
    return (
      <div className="p-4 flex items-center gap-3 opacity-60">
        <div className="w-9 h-9 rounded-lg bg-paper-sunken flex items-center justify-center text-lg">
          {p.emoji ?? "🌱"}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{p.name}</div>
          <div className="text-xs text-ink-muted">{p.city}</div>
        </div>
        <div className="text-xs text-ink-muted">
          {status === "approved"
            ? lang === "es"
              ? "✓ Aprobado"
              : "✓ Approved"
            : status === "funded"
              ? lang === "es"
                ? "✓ En curso"
                : "✓ Funded"
              : lang === "es"
                ? "✗ Rechazado"
                : "✗ Rejected"}
        </div>
      </div>
    );
  }

  const story = pickLocalized(p, "story", lang);
  const need = pickLocalized(p, "need", lang);
  const why = pickLocalized(p, "why", lang);

  return (
    <details>
      <summary className="p-4 flex items-center gap-3 cursor-pointer hover:bg-paper-subtle flex-wrap">
        <div className="w-9 h-9 rounded-lg bg-paper-sunken flex items-center justify-center text-lg shrink-0">
          {p.emoji ?? "🌱"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{p.name}</div>
          <div className="text-xs text-ink-muted">
            {p.city} · {t(`cat.${p.category}`)} · {lang === "es" ? "por" : "by"} {p.postulantName}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={(e) => { e.preventDefault(); act("reject"); }} disabled={busy}>
            <X className="w-3.5 h-3.5" />
            {t("adm.reject")}
          </Button>
          <Button size="sm" onClick={(e) => { e.preventDefault(); act("approve"); }} disabled={busy}>
            <Check className="w-3.5 h-3.5" />
            {t("adm.approve")}
          </Button>
          <ChevronDown className="w-4 h-4 text-ink-faint chev shrink-0" />
        </div>
      </summary>
      <div className="px-4 pb-4 bg-paper-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <Row
            label={lang === "es" ? "Años operando" : "Years operating"}
            value={String(p.yearsOperating ?? "—")}
          />
          <Row label={lang === "es" ? "Categoría" : "Category"} value={t(`cat.${p.category}`)} />
          <Row label={lang === "es" ? "Postulante" : "Nominator"} value={p.postulantName} />
          <Row label={lang === "es" ? "Email" : "Email"} value={p.postulantEmail} />
          <Row label={lang === "es" ? "Relación" : "Relation"} value={t(`postular.rel.${p.postulantRelation}`)} />
          <Row label={lang === "es" ? "Votos" : "Votes"} value={String(p.votesCount)} />
        </div>
        {p.address && (
          <div className="bg-paper border border-line rounded-xl p-3 text-xs">
            <div className="flex items-start gap-2 text-ink-subtle uppercase tracking-wider text-[10px] mb-1">
              <MapPin className="w-3 h-3 mt-0.5" />
              {lang === "es" ? "Dirección (privada)" : "Address (private)"}
            </div>
            <div className="text-sm text-ink">{p.address}</div>
          </div>
        )}
        {story && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              {lang === "es" ? "Historia" : "Story"}
            </div>
            <p className="text-sm text-ink leading-relaxed">{story}</p>
          </div>
        )}
        {need && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              {lang === "es" ? "Necesita" : "Needs"}
            </div>
            <p className="text-sm text-ink leading-relaxed">{need}</p>
          </div>
        )}
        {why && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              {lang === "es" ? "Por qué merece" : "Why it deserves to grow"}
            </div>
            <p className="text-sm text-ink leading-relaxed">{why}</p>
          </div>
        )}
        {p.youtubeUrl && (
          <a
            href={p.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            {lang === "es" ? "Ver video del negocio" : "Watch business video"}
          </a>
        )}
      </div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-1.5 border-b border-line/60 last:border-0 flex justify-between gap-3 min-w-0">
      <span className="text-ink-subtle uppercase tracking-wider text-[10px]">{label}</span>
      <span className="text-ink text-right break-all">{value}</span>
    </div>
  );
}
