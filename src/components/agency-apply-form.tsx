"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Check, Send } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";

const CATEGORIES = ["marketing", "tech", "accounting", "legal", "export"] as const;

export function AgencyApplyForm({ userEmail }: { userEmail: string }) {
  const { t } = useT();
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    category: "marketing" as (typeof CATEGORIES)[number],
    city: "",
    leadName: "",
    contactEmail: userEmail,
    blurb: "",
    certifications: "",
    teamSize: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid =
    data.name.length >= 2 &&
    data.city.length >= 2 &&
    data.leadName.length >= 2 &&
    /.+@.+\..+/.test(data.contactEmail) &&
    data.blurb.length >= 20;

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/agencies/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          teamSize: data.teamSize ? Number(data.teamSize) : undefined,
        }),
      });
      const j = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !j.id) throw new Error(j.error ?? "submit-failed");
      setDone(true);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-brand-soft border border-brand-border rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand text-paper flex items-center justify-center mx-auto">
          <Check className="w-6 h-6" />
        </div>
        <h2 className="serif text-3xl mt-5">
          {t("agencyapply.ok.t", "¡Postulación enviada!")}
        </h2>
        <p className="text-ink-muted mt-2 max-w-md mx-auto">
          {t("agencyapply.ok.p", "Telos revisará tu agencia (cámara de comercio, RUT, referencias) en los próximos 7 días. Te avisaremos por email cuando esté lista para postular a RFPs.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-paper border border-line rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-ink flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="serif text-2xl tracking-tight">
            {t("agencyapply.t", "Postular como agencia")}
          </h2>
          <p className="text-sm text-ink-muted">
            {t(
              "agencyapply.sub",
              "Cuéntanos de tu agencia. Telos verifica con cámara de comercio, RUT y mínimo 3 referencias. Proceso ~7 días.",
            )}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>{t("agencyapply.f.name", "Nombre de la agencia")}</Label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Ej: Marca Viva"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>{t("agencyapply.f.category", "Categoría principal")}</Label>
            <Select
              value={data.category}
              onChange={(e) =>
                setData({ ...data, category: e.target.value as (typeof CATEGORIES)[number] })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("agencyapply.f.city", "Ciudad")}</Label>
            <Input
              value={data.city}
              onChange={(e) => setData({ ...data, city: e.target.value })}
              placeholder="Ej: Medellín"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>{t("agencyapply.f.lead", "Lead / contacto principal")}</Label>
            <Input
              value={data.leadName}
              onChange={(e) => setData({ ...data, leadName: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <Label>{t("agencyapply.f.team", "Tamaño del equipo")}</Label>
            <Input
              type="number"
              value={data.teamSize}
              onChange={(e) => setData({ ...data, teamSize: e.target.value })}
              placeholder="3"
              className="tabular"
            />
          </div>
        </div>
        <div>
          <Label>{t("agencyapply.f.contact", "Email de contacto de la agencia")}</Label>
          <Input
            type="email"
            value={data.contactEmail}
            onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
          />
          <div className="text-xs text-ink-subtle mt-1">
            {t(
              "agencyapply.f.contactnote",
              "Aquí enviaremos avisos de RFPs abiertos. Puede ser el mismo que usaste para entrar o uno corporativo.",
            )}
          </div>
        </div>
        <div>
          <Label>{t("agencyapply.f.blurb", "Sobre tu agencia")}</Label>
          <Textarea
            rows={4}
            value={data.blurb}
            onChange={(e) => setData({ ...data, blurb: e.target.value })}
            placeholder={t(
              "agencyapply.f.blurbph",
              "Qué hacen, hace cuántos años, qué tipo de clientes, qué los hace distintos…",
            )}
          />
        </div>
        <div>
          <Label>
            {t("agencyapply.f.cert", "Certificaciones / acreditaciones")}{" "}
            <span className="text-ink-faint font-normal">{t("postular.f.optional")}</span>
          </Label>
          <Input
            value={data.certifications}
            onChange={(e) => setData({ ...data, certifications: e.target.value })}
            placeholder="Ej: Google Partner, JCC, Shopify Partner"
          />
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

      <Button onClick={submit} disabled={!valid || submitting} className="mt-6 w-full py-3.5 rounded-xl">
        <Send className="w-4 h-4" />
        <span>{t("agencyapply.submit", "Enviar postulación")}</span>
      </Button>

      <div className="mt-4 bg-paper-subtle border border-line rounded-xl p-3 text-xs text-ink-muted">
        {t(
          "agencyapply.next",
          "Después de enviar: Telos revisará tu agencia. Mientras tanto, podrás ver el portal pero no postular a RFPs hasta que estés verificada.",
        )}
      </div>
    </div>
  );
}
