import { requireAgency } from "@/lib/auth/rbac";
import { getT } from "@/lib/i18n/server";
import { fetchAgencyByUser, fetchRfpsForAgency } from "@/lib/data/queries";
import { StatCell, StatStrip, Card, CardHeader } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { AgencyRfpRow } from "@/components/agency-rfp-row";
import { fmtCop } from "@/lib/utils";

export default async function AgencyPortalPage() {
  const session = await requireAgency();
  const { t, lang } = await getT();

  const agency = await fetchAgencyByUser(session.userId);

  if (!agency) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="serif text-4xl tracking-tight">
          {lang === "es" ? "Tu agencia no está verificada todavía" : "Your agency isn't verified yet"}
        </h1>
        <p className="text-ink-muted mt-3">
          {lang === "es"
            ? "Telos revisa cada agencia con cámara de comercio, RUT y referencias. Te avisaremos por email cuando esté lista."
            : "Telos verifies each agency via chamber of commerce, tax ID and references. We'll email you when ready."}
        </p>
      </div>
    );
  }

  const rfps = await fetchRfpsForAgency(agency.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
            <span>
              {t("ap.kicker")} · {agency.name}
            </span>
            <LogoutButton />
          </div>
          <h1 className="serif text-5xl tracking-tight">
            {t("ap.title")}, {agency.name}.
          </h1>
          <p className="text-ink-muted mt-2">{t("ap.sub")}</p>
        </div>
      </div>

      <div className="mt-10">
        <StatStrip>
          <StatCell label={t("ap.active")} value={agency.projectsCompleted} />
          <StatCell label={t("ap.pending")} value={rfps.length} />
          <StatCell label={t("ap.invoiced")} value={fmtCop(0)} />
          <StatCell label={t("ap.csat")} value={agency.csat ? `${(agency.csat / 10).toFixed(1)} / 5` : "—"} />
        </StatStrip>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader
            title={t("ap.rfps.t")}
            subtitle={t("ap.rfps.sub")}
            right={
              <span className="text-xs bg-brand-soft text-brand-ink border border-brand-border rounded-full px-2.5 py-0.5">
                {rfps.length} {lang === "es" ? "abiertas" : "open"}
              </span>
            }
          />
          {rfps.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle">{t("ap.rfps.empty")}</div>
          ) : (
            <div className="divide-y divide-line">
              {rfps.map((r) => (
                <AgencyRfpRow
                  key={r.rfp.id}
                  rfp={r.rfp}
                  business={r.business}
                  alreadyBid={r.alreadyBid}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
