import { Briefcase, Loader, ShieldCheck } from "lucide-react";
import { requireSession } from "@/lib/auth/rbac";
import { getT } from "@/lib/i18n/server";
import { fetchAgencyByUser, fetchRfpsForAgency } from "@/lib/data/queries";
import { StatCell, StatStrip, Card, CardHeader, Pill } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { AgencyRfpRow } from "@/components/agency-rfp-row";
import { AgencyApplyForm } from "@/components/agency-apply-form";
import { fmtCop, pickLocalized } from "@/lib/utils";

export default async function AgencyPortalPage() {
  const session = await requireSession("/auth/magic-link?next=/portal/agencia");
  const { t, lang } = await getT();

  const agency = await fetchAgencyByUser(session.userId);

  // ── No linked agency → apply form ──────────────────────────────────
  if (!agency) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t("nav.portal.agency")}</span>
              <LogoutButton />
            </div>
            <h1 className="serif text-4xl sm:text-5xl tracking-tight">
              {t("agency.welcome.t", "¿Quieres recibir RFPs?")}
            </h1>
            <p className="text-ink-muted mt-2 max-w-xl">
              {t(
                "agency.welcome.p",
                "Postula tu agencia. Una vez verificada por Telos, recibirás email cuando se abra un RFP en tu categoría.",
              )}
            </p>
          </div>
        </div>
        <AgencyApplyForm userEmail={session.email} />
      </div>
    );
  }

  // ── Pending verification → waiting state ───────────────────────────
  if (agency.status === "pending_verification") {
    const blurb = pickLocalized(agency, "blurb", lang);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>
            {t("nav.portal.agency")} · {agency.name}
          </span>
          <LogoutButton />
        </div>
        <h1 className="serif text-4xl sm:text-5xl tracking-tight">
          {t("agency.pending.t", "Tu agencia está siendo verificada.")}
        </h1>
        <p className="text-ink-muted mt-3 max-w-xl">
          {t(
            "agency.pending.p",
            "Telos está revisando cámara de comercio, RUT y referencias. Cuando esté lista (típicamente 5–7 días), recibirás email y empezarán a llegarte RFPs.",
          )}
        </p>
        <Card className="mt-8 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Loader className="w-5 h-5" />
            </div>
            <div>
              <Pill tone="amber">
                {t("agency.pending.status", "En revisión")}
              </Pill>
              <div className="font-semibold tracking-tight mt-2">{agency.name}</div>
              <div className="text-xs text-ink-muted">
                {t(`cat.${agency.category}`)} · {agency.city}
              </div>
            </div>
          </div>
          {blurb && (
            <div className="bg-paper-subtle border border-line rounded-xl p-4 text-sm text-ink-muted leading-relaxed">
              {blurb}
            </div>
          )}
          <div className="mt-4 text-xs text-ink-muted">
            {t("agency.pending.contact", "Email de contacto:")} {agency.contactEmail}
          </div>
        </Card>
      </div>
    );
  }

  // ── Suspended → quiet message ──────────────────────────────────────
  if (agency.status === "suspended") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="serif text-3xl tracking-tight">
          {t("agency.suspended.t", "Tu agencia está suspendida")}
        </h1>
        <p className="text-ink-muted mt-3">
          {t(
            "agency.suspended.p",
            "Escríbenos a hola@telos.foundation y revisamos el caso.",
          )}
        </p>
      </div>
    );
  }

  // ── Active agency → full portal ────────────────────────────────────
  const rfps = await fetchRfpsForAgency(agency.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>
              {t("ap.kicker")} · {agency.name}
            </span>
            <Pill tone="brand">
              <ShieldCheck className="w-2.5 h-2.5" />
              {t("ag.verified")}
            </Pill>
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
          <StatCell
            label={t("ap.csat")}
            value={agency.csat ? `${(agency.csat / 10).toFixed(1)} / 5` : "—"}
          />
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
