import { requireAdmin } from "@/lib/auth/rbac";
import { getT } from "@/lib/i18n/server";
import {
  fetchAllRfpsWithProposals,
  fetchKpis,
  fetchPendingAgencies,
  fetchPendingDonations,
  fetchPendingPostulados,
} from "@/lib/data/queries";
import { StatCell, StatStrip, Card, CardHeader, Pill } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { AdminPipeline } from "@/components/admin-pipeline";
import { AdminDonationRow } from "@/components/admin-donation-row";
import { AdminPostuladoRow } from "@/components/admin-postulado-row";
import { AdminAgencyRow } from "@/components/admin-agency-row";
import { fmtCop } from "@/lib/utils";

export default async function AdminPage() {
  const session = await requireAdmin();
  const { t, lang } = await getT();
  const [kpis, pendingDonations, pendingPostulados, pendingAgencies, allRfps] = await Promise.all([
    fetchKpis(),
    fetchPendingDonations(),
    fetchPendingPostulados(),
    fetchPendingAgencies(),
    fetchAllRfpsWithProposals(),
  ]);

  void session;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
            <span>{t("adm.kicker")}</span>
            <LogoutButton />
          </div>
          <h1 className="serif text-5xl tracking-tight">{t("adm.title")}.</h1>
          <p className="text-ink-muted mt-2">{t("adm.sub")}</p>
        </div>
        <Pill tone="brand">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          {t("adm.live")}
        </Pill>
      </div>

      <div className="mt-10">
        <StatStrip>
          <StatCell label={t("trans.escrow")} value={fmtCop(kpis.raisedCents)} />
          <StatCell label={lang === "es" ? "Postulados pendientes" : "Pending nominations"} value={pendingPostulados.length} />
          <StatCell label={lang === "es" ? "Agencias por verificar" : "Agencies to verify"} value={pendingAgencies.length} />
          <StatCell label={lang === "es" ? "Donaciones por validar" : "Donations to validate"} value={pendingDonations.length} />
        </StatStrip>
      </div>

      {pendingAgencies.length > 0 && (
        <div className="mt-10">
          <Card>
            <CardHeader
              title={lang === "es" ? "Agencias por verificar" : "Agencies to verify"}
              subtitle={
                lang === "es"
                  ? "Revisar cámara de comercio + RUT + referencias antes de aprobar."
                  : "Check chamber of commerce + tax ID + references before approving."
              }
            />
            <div className="divide-y divide-line">
              {pendingAgencies.map((a) => (
                <AdminAgencyRow key={a.id} agency={a} lang={lang} />
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title={t("adm.donations.t")} subtitle="" />
          {pendingDonations.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle">
              {t("adm.donations.empty")}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {pendingDonations.map((d) => (
                <AdminDonationRow key={d.id} donation={d} lang={lang} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title={lang === "es" ? "Postulados por aprobar" : "Pending nominations"}
            subtitle={lang === "es" ? "Revisar y aprobar / rechazar" : "Review and approve / reject"}
          />
          {pendingPostulados.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-subtle">—</div>
          ) : (
            <div className="divide-y divide-line">
              {pendingPostulados.map((p) => (
                <AdminPostuladoRow key={p.id} postulado={p} lang={lang} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-10">
        <AdminPipeline rfps={allRfps} lang={lang} />
      </div>
    </div>
  );
}
