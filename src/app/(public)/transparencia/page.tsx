import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { fetchKpis, fetchLedger, fetchOpenRfps } from "@/lib/data/queries";
import { Card, CardHeader, StatStrip, StatCell } from "@/components/ui/card";
import { LedgerTable } from "@/components/ledger-table";
import { PublicRfpCard } from "@/components/rfp-card";
import { fmtCop } from "@/lib/utils";

export default async function TransparenciaPage() {
  const { t, lang } = await getT();
  const [kpis, ledgerRows, openRfps] = await Promise.all([
    fetchKpis(),
    fetchLedger({ limit: 50 }),
    fetchOpenRfps(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
            {t("trans.kicker")}
          </div>
          <h1 className="serif text-5xl tracking-tight leading-[1.05]">{t("trans.title")}</h1>
          <p className="text-ink-muted mt-3 max-w-2xl">{t("trans.sub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/ledger/export"
            download
            className="inline-flex items-center gap-1.5 border border-line rounded-full px-3 py-1.5 text-sm hover:bg-paper-sunken"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("trans.csv")}</span>
          </a>
        </div>
      </div>

      <div className="mt-10">
        <StatStrip>
          <StatCell label={t("stat.raised")} value={fmtCop(kpis.raisedCents)} />
          <StatCell label={t("stat.disbursed")} value={fmtCop(Math.round(kpis.raisedCents * 0.8))} />
          <StatCell label={t("trans.escrow")} value={fmtCop(Math.round(kpis.raisedCents * 0.2))} sub={t("trans.pending")} />
          <StatCell label={t("stat.toservices")} value="100%" sub={t("stat.fee0")} />
        </StatStrip>
      </div>

      {/* Public RFPs */}
      <div className="mt-10">
        <Card>
          <CardHeader
            title={t("trans.rfps.t")}
            subtitle={t("trans.rfps.sub")}
            right={
              <Link href="/portal/agencia" className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1">
                <span>{t("trans.rfps.cta")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {openRfps.length === 0 && (
              <div className="p-8 text-center text-sm text-ink-subtle">
                {lang === "es"
                  ? "No hay RFPs abiertas en este momento."
                  : "No open RFPs right now."}
              </div>
            )}
            {openRfps.map((r) => (
              <PublicRfpCard
                key={r.rfp.id}
                rfp={r.rfp}
                business={r.business}
                proposals={r.proposals.map((p) => ({
                  id: p.id,
                  agency: p.agency ? { id: p.agency.id, name: p.agency.name } : null,
                  costCents: p.costCents,
                  weeks: p.weeks,
                  teamSize: p.teamSize,
                }))}
                lang={lang}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Ledger */}
      <div className="mt-10">
        <Card>
          <CardHeader title={t("trans.ledger")} subtitle={t("trans.ledgersub")} />
          <LedgerTable rows={ledgerRows} lang={lang} />
        </Card>
      </div>
    </div>
  );
}
