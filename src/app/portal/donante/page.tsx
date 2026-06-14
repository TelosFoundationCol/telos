import Link from "next/link";
import { ArrowRight, ChevronRight, HandCoins, Plus } from "lucide-react";
import { requireDonor } from "@/lib/auth/rbac";
import { getT } from "@/lib/i18n/server";
import { fetchDonorImpact } from "@/lib/data/queries";
import { StatCell, StatStrip, Card } from "@/components/ui/card";
import { fmtMoney } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

export default async function DonorPortalPage() {
  const session = await requireDonor();
  const { t, lang } = await getT();
  const donations = await fetchDonorImpact(session.email);

  const confirmed = donations.filter((d) => d.status === "confirmed");
  const pending = donations.find((d) => d.status === "pending_proof");
  const totalDonated = confirmed.reduce((acc, d) => {
    // sum in approx USD
    if (d.currency === "USD" || d.currency === "USDC") return acc + d.amountCents;
    return acc + d.amountCents / 4000;
  }, 0);
  const businessIds = new Set(donations.map((d) => d.destinationBusinessId).filter(Boolean));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
            <span>{t("dp.kicker")}</span>
            <LogoutButton />
          </div>
          <h1 className="serif text-5xl tracking-tight">
            {t("dp.title")},{" "}
            {(session.email.split("@")[0] || "").replace(/[._]/g, " ")}.
          </h1>
          <p className="text-ink-muted mt-2">{t("dp.sub")}</p>
        </div>
        <Link
          href="/donar"
          className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-full text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>{t("dp.again")}</span>
        </Link>
      </div>

      <div className="mt-10">
        <StatStrip>
          <StatCell label={t("dp.totaldonated")} value={`USD $${totalDonated.toFixed(0)}`} />
          <StatCell label={t("dp.businesses")} value={businessIds.size} />
          <StatCell label={t("dp.deliverables")} value={confirmed.length} />
          <StatCell label={t("dp.thisyear")} value={`USD $${totalDonated.toFixed(0)}`} />
        </StatStrip>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div className="text-sm font-medium">{t("dp.impact")}</div>
              <Link
                href="/transparencia"
                className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
              >
                <span>{t("dp.viewledger")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {donations.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-subtle">{t("dp.empty")}</div>
            ) : (
              <div className="divide-y divide-line">
                {donations.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-5">
                    <div className="w-10 h-10 rounded-xl bg-paper-sunken flex items-center justify-center text-xl">
                      💸
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {d.destinationKind === "general"
                          ? lang === "es"
                            ? "Fondo general Telos"
                            : "Telos general fund"
                          : d.destinationKind === "category"
                            ? `${t("don.dest.category")}`
                            : lang === "es"
                              ? "Negocio específico"
                              : "Specific business"}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {d.reference} · {d.status === "confirmed"
                          ? lang === "es"
                            ? "Validado"
                            : "Confirmed"
                          : d.status === "pending_proof"
                            ? lang === "es"
                              ? "Validando"
                              : "Validating"
                            : "Rechazado"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="tabular font-medium">{fmtMoney(d.amountCents, d.currency)}</div>
                      <div className="text-xs text-ink-subtle tabular">
                        {d.submittedAt.toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-faint" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          {pending ? (
            <Card className="p-5">
              <div className="text-sm font-medium mb-3">{t("dp.pending")}</div>
              <div className="bg-paper-subtle border border-line rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-ink-subtle uppercase tracking-wider">
                      {t("dp.lastsent")}
                    </div>
                    <div className="serif text-2xl mt-1 tabular">
                      {fmtMoney(pending.amountCents, pending.currency)}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{t("dp.validating")}</span>
                  </span>
                </div>
                <div className="text-xs text-ink-muted mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>{t("dp.refl")}</span>
                    <span className="font-mono tabular">{pending.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("dp.submitted")}</span>
                    <span>{pending.submittedAt.toISOString().slice(0, 10)}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-ink-muted">{t("dp.eta")}</div>
              </div>
            </Card>
          ) : null}
          <div className="bg-brand-soft border border-brand-border rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <HandCoins className="w-5 h-5 text-brand-ink mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-brand-ink text-sm">{t("dp.again.t")}</div>
                <p className="text-xs text-ink-muted mt-1">{t("dp.again.p")}</p>
                <Link
                  href="/donar"
                  className="mt-3 inline-flex items-center gap-2 text-xs bg-ink text-paper rounded-full px-3 py-1.5"
                >
                  <span>{t("dp.again.cta")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
