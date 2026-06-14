import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { AgencyApplyForm } from "@/components/agency-apply-form";

export default async function ApplyAgencyPage() {
  const { t, lang } = await getT();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
        <div>
          <Link
            href="/agencias"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === "es" ? "Volver a agencias" : "Back to agencies"}</span>
          </Link>
          <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
            {lang === "es" ? "Postular como agencia" : "Apply as an agency"}
          </div>
          <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            {lang === "es"
              ? "Sé parte del marketplace de servicios de Telos."
              : "Join the Telos services marketplace."}
          </h1>
          <p className="text-ink-muted mt-3 max-w-xl">
            {lang === "es"
              ? "Una vez verificada, recibirás por email los RFPs abiertos en tu categoría. Postulas tus propuestas desde tu portal y el negocio elige."
              : "Once verified, you'll receive emails for open RFPs in your category. Submit proposals from your portal and the business picks."}
          </p>

          <div className="mt-8">
            <AgencyApplyForm userEmail="" />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-paper-subtle border border-line rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3">
              {lang === "es" ? "Qué pasa después" : "What happens next"}
            </div>
            <ol className="space-y-3 text-sm">
              <Step n="1" text={lang === "es" ? "Recibes un link mágico al email de contacto. Es así como entras a tu portal — sin contraseña." : "You get a magic link at your contact email. That's how you enter your portal — no password."} />
              <Step n="2" text={lang === "es" ? "Telos verifica tu agencia (cámara de comercio, RUT, referencias). Toma ~5–7 días." : "Telos verifies your agency (chamber of commerce, tax ID, references). Takes ~5–7 days."} />
              <Step n="3" text={lang === "es" ? "Cuando esté aprobada, te llega un email cada vez que se abre un RFP en tu categoría." : "Once approved, you get an email every time an RFP opens in your category."} />
              <Step n="4" text={lang === "es" ? "Postulas tu propuesta (alcance + costo + plazos). El negocio elige." : "You submit your proposal (scope + cost + timeline). The business picks."} />
            </ol>
          </div>
          <div className="mt-4 bg-paper border border-line rounded-2xl p-4 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-brand inline -mt-0.5 mr-1" />
            {lang === "es"
              ? "Tu información de contacto queda privada. Solo el equipo de Telos la usa para verificación."
              : "Your contact info stays private. Only the Telos team uses it for verification."}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="serif text-brand tabular shrink-0 w-5">{n}</span>
      <span>{text}</span>
    </li>
  );
}
