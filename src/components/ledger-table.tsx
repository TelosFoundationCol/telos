"use client";

import { useState } from "react";
import { ChevronRight, ExternalLink, X } from "lucide-react";
import type { LedgerEntry } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { fmtMoney, pickLocalized } from "@/lib/utils";

export function LedgerTable({ rows, lang }: { rows: LedgerEntry[]; lang: Lang }) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [active, setActive] = useState<LedgerEntry | null>(null);
  return (
    <>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead className="bg-paper-subtle text-ink-subtle text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left font-medium px-5 py-2.5">{t("trans.col.date")}</th>
              <th className="text-left font-medium px-5 py-2.5">{t("trans.col.type")}</th>
              <th className="text-left font-medium px-5 py-2.5">{t("trans.col.from")}</th>
              <th className="text-left font-medium px-5 py-2.5">{t("trans.col.to")}</th>
              <th className="text-left font-medium px-5 py-2.5">{t("trans.col.purpose")}</th>
              <th className="text-right font-medium px-5 py-2.5">{t("trans.col.amount")}</th>
              <th className="text-right font-medium px-5 py-2.5">{t("trans.col.proof")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-paper-subtle cursor-pointer"
                onClick={() => setActive(r)}
              >
                <td className="px-5 py-3 text-ink-muted tabular text-xs">
                  {r.occurredAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-5 py-3">
                  <TypePill kind={r.kind} t={t} />
                </td>
                <td className="px-5 py-3">{r.fromName}</td>
                <td className="px-5 py-3 font-medium">{r.toName}</td>
                <td className="px-5 py-3 text-ink-muted">{pickLocalized(r, "purpose", lang)}</td>
                <td
                  className={`px-5 py-3 text-right tabular ${
                    r.kind === "donation"
                      ? "text-brand"
                      : r.kind === "disbursement"
                        ? "text-ink"
                        : "text-ink-subtle"
                  }`}
                >
                  {r.amountCents == null ? "—" : fmtMoney(r.amountCents, r.currency)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-xs text-ink-muted tabular">
                    <span className="font-mono">{r.referenceHash}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink-subtle">
                  —
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {active && <LedgerDetailModal entry={active} lang={lang} onClose={() => setActive(null)} />}
    </>
  );
}

function TypePill({ kind, t }: { kind: "donation" | "disbursement" | "deliverable"; t: (k: string) => string }) {
  const map = {
    donation: ["bg-emerald-50 text-emerald-700 border-emerald-200", t("trans.filter.donation").replace(/s$/, "")],
    disbursement: ["bg-blue-50 text-blue-700 border-blue-200", t("trans.filter.disbursement").replace(/s$/, "")],
    deliverable: ["bg-stone-100 text-stone-700 border-stone-200", t("trans.filter.deliverable").replace(/s$/, "")],
  } as const;
  const [cls, label] = map[kind];
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function LedgerDetailModal({
  entry: r,
  lang,
  onClose,
}: {
  entry: LedgerEntry;
  lang: Lang;
  onClose: () => void;
}) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-ink-subtle uppercase tracking-wider">
              {lang === "es" ? "Detalle de transacción" : "Transaction detail"}
            </div>
            <div className="font-mono text-lg tabular mt-1">{r.referenceHash}</div>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <TypePill kind={r.kind} t={t} />
        </div>

        <dl className="space-y-3 text-sm">
          <Field label={t("trans.col.date")} value={r.occurredAt.toISOString().slice(0, 19).replace("T", " ")} />
          <Field label={t("trans.col.from")} value={r.fromName} />
          <Field label={t("trans.col.to")} value={r.toName} />
          <Field label={t("trans.col.purpose")} value={pickLocalized(r, "purpose", lang)} />
          {r.amountCents != null && (
            <Field
              label={t("trans.col.amount")}
              value={fmtMoney(r.amountCents, r.currency)}
              accent
            />
          )}
        </dl>

        <div className="mt-6 pt-4 border-t border-line text-xs text-ink-subtle">
          {lang === "es"
            ? "Este registro es inmutable. La trazabilidad completa quedará disponible al cierre del año fiscal con auditoría externa."
            : "This record is immutable. Full traceability will be available at fiscal year-end with external audit."}
        </div>

        {(r.kind === "donation" || r.kind === "disbursement") && (
          <a
            href={`/api/ledger/export`}
            className="mt-4 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
          >
            {lang === "es" ? "Exportar libro mayor" : "Export ledger"}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
      <dt className="text-ink-subtle text-xs uppercase tracking-wider">{label}</dt>
      <dd className={`text-right tabular ${accent ? "text-brand font-semibold" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
