"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Donation } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminDonationRow({ donation: d, lang }: { donation: Donation; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [status, setStatus] = useState<"pending_proof" | "confirmed" | "rejected">(d.status);
  const [busy, setBusy] = useState(false);

  async function act(action: "confirm" | "reject") {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/donations/${d.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setStatus(action === "confirm" ? "confirmed" : "rejected");
    } catch (e) {
      alert(t("common.error"));
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  if (status !== "pending_proof") {
    return (
      <div className="p-4 flex items-center gap-3 opacity-60">
        <div className="flex-1 min-w-0">
          <div className="text-sm">{d.donorEmail}</div>
          <div className="text-xs text-ink-muted font-mono">{d.reference}</div>
        </div>
        <div className="text-xs text-ink-muted">
          {status === "confirmed"
            ? lang === "es"
              ? "✓ Validada"
              : "✓ Confirmed"
            : lang === "es"
              ? "✗ Rechazada"
              : "✗ Rejected"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">
          {d.anonymous ? (lang === "es" ? "Anónimo" : "Anonymous") : d.donorName ?? d.donorEmail}
        </div>
        <div className="text-xs text-ink-muted">
          <span className="font-mono">{d.reference}</span> · {fmtMoney(d.amountCents, d.currency)}
          {d.bankReference ? ` · ${d.bankReference}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => act("reject")} disabled={busy}>
          <X className="w-3.5 h-3.5" />
          {t("adm.donations.reject")}
        </Button>
        <Button size="sm" onClick={() => act("confirm")} disabled={busy}>
          <Check className="w-3.5 h-3.5" />
          {t("adm.donations.confirm")}
        </Button>
      </div>
    </div>
  );
}
