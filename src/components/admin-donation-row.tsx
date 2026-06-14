"use client";

import { useState } from "react";
import { Check, ChevronDown, ExternalLink, FileText, X } from "lucide-react";
import type { Donation } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AdminDonationRow({ donation: d, lang }: { donation: Donation; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [status, setStatus] = useState<"pending_proof" | "confirmed" | "rejected">(d.status);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofErr, setProofErr] = useState<string | null>(null);

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

  async function loadProof() {
    setProofErr(null);
    try {
      const res = await fetch(`/api/admin/donations/${d.id}/proof-url`);
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "no-proof");
      setProofUrl(j.url);
      window.open(j.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setProofErr((e as Error).message);
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
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="p-4 flex items-center gap-3 cursor-pointer hover:bg-paper-subtle group flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {d.anonymous ? (lang === "es" ? "Anónimo" : "Anonymous") : d.donorName ?? d.donorEmail}
          </div>
          <div className="text-xs text-ink-muted">
            <span className="font-mono">{d.reference}</span> · {fmtMoney(d.amountCents, d.currency)}
            {d.bankReference ? ` · ${d.bankReference}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={(e) => { e.preventDefault(); act("reject"); }} disabled={busy}>
            <X className="w-3.5 h-3.5" />
            {t("adm.donations.reject")}
          </Button>
          <Button size="sm" onClick={(e) => { e.preventDefault(); act("confirm"); }} disabled={busy}>
            <Check className="w-3.5 h-3.5" />
            {t("adm.donations.confirm")}
          </Button>
          <ChevronDown className="w-4 h-4 text-ink-faint chev shrink-0" />
        </div>
      </summary>
      <div className="px-4 pb-4 bg-paper-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <Row label={lang === "es" ? "Email donante" : "Donor email"} value={d.donorEmail} />
          <Row
            label={lang === "es" ? "Nombre" : "Name"}
            value={d.anonymous ? (lang === "es" ? "(anónimo)" : "(anonymous)") : d.donorName ?? "—"}
          />
          <Row label={lang === "es" ? "País" : "Country"} value={d.donorCountry ?? "—"} />
          <Row label={lang === "es" ? "Moneda" : "Currency"} value={d.currency} />
          <Row label={lang === "es" ? "Destino" : "Destination"} value={d.destinationKind} />
          <Row
            label={lang === "es" ? "Ref. bancaria" : "Bank reference"}
            value={d.bankReference ?? "—"}
          />
          <Row
            label={lang === "es" ? "Fecha transferencia" : "Transfer date"}
            value={d.transferredAt ? d.transferredAt.toISOString().slice(0, 10) : "—"}
          />
          <Row
            label={lang === "es" ? "Enviado" : "Submitted"}
            value={d.submittedAt.toISOString().slice(0, 16).replace("T", " ")}
          />
        </div>
        {d.message && (
          <div className="mt-3 bg-paper border border-line rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle mb-1">
              {lang === "es" ? "Mensaje del donante" : "Donor message"}
            </div>
            <div className="text-sm text-ink leading-relaxed">{d.message}</div>
          </div>
        )}
        {d.proofObjectKey && (
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={(e) => { e.preventDefault(); loadProof(); }}>
              <FileText className="w-3.5 h-3.5" />
              {lang === "es" ? "Ver comprobante" : "View proof"}
              <ExternalLink className="w-3 h-3" />
            </Button>
            {proofErr && <span className="text-xs text-rose-600">{proofErr}</span>}
            {proofUrl && (
              <span className="text-xs text-ink-subtle">
                {lang === "es" ? "(válido 10 min)" : "(valid 10 min)"}
              </span>
            )}
          </div>
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
