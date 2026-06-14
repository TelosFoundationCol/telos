"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Agency } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { pickLocalized } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminAgencyRow({ agency: a, lang }: { agency: Agency; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [status, setStatus] = useState<"pending_verification" | "active" | "suspended">(a.status);
  const [busy, setBusy] = useState(false);

  async function act(action: "verify" | "suspend") {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/agencies/${a.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setStatus(action === "verify" ? "active" : "suspended");
    } catch {
      alert(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  const blurb = pickLocalized(a, "blurb", lang);
  const cert = pickLocalized(a, "certifications", lang);

  if (status !== "pending_verification") {
    return (
      <div className="p-4 flex items-center gap-3 opacity-60">
        <div className="flex-1">
          <div className="text-sm font-medium">{a.name}</div>
          <div className="text-xs text-ink-muted">
            {t(`cat.${a.category}`)} · {a.city}
          </div>
        </div>
        <div className="text-xs text-ink-muted">
          {status === "active"
            ? lang === "es"
              ? "✓ Verificada"
              : "✓ Active"
            : lang === "es"
              ? "✗ Suspendida"
              : "✗ Suspended"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-medium">{a.name}</div>
          <div className="text-xs text-ink-muted mt-0.5">
            {t(`cat.${a.category}`)} · {a.city} · Lead: {a.leadName ?? "—"}
          </div>
          <div className="text-xs text-ink-muted mt-0.5">Contact: {a.contactEmail}</div>
          {blurb && <p className="text-sm text-ink-muted mt-2 leading-relaxed">{blurb}</p>}
          {cert && (
            <div className="text-xs text-ink-muted mt-1.5">
              <span className="text-ink-subtle">
                {lang === "es" ? "Certificaciones" : "Certifications"}:
              </span>{" "}
              {cert}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => act("suspend")} disabled={busy}>
            <X className="w-3.5 h-3.5" />
            {t("adm.reject")}
          </Button>
          <Button size="sm" onClick={() => act("verify")} disabled={busy}>
            <Check className="w-3.5 h-3.5" />
            {lang === "es" ? "Verificar" : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
}
