"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Postulado } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
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
          {status === "approved" ? "✓" : "✗"}{" "}
          {status === "approved" ? (lang === "es" ? "Aprobado" : "Approved") : lang === "es" ? "Rechazado" : "Rejected"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex items-center gap-3 flex-wrap">
      <div className="w-9 h-9 rounded-lg bg-paper-sunken flex items-center justify-center text-lg shrink-0">
        {p.emoji ?? "🌱"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{p.name}</div>
        <div className="text-xs text-ink-muted">
          {p.city} · {t(`cat.${p.category}`)} · {lang === "es" ? "Postulado por" : "By"} {p.postulantName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => act("reject")} disabled={busy}>
          <X className="w-3.5 h-3.5" />
          {t("adm.reject")}
        </Button>
        <Button size="sm" onClick={() => act("approve")} disabled={busy}>
          <Check className="w-3.5 h-3.5" />
          {t("adm.approve")}
        </Button>
      </div>
    </div>
  );
}
