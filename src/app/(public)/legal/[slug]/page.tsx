import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getT } from "@/lib/i18n/server";

type LegalSlug = "privacidad" | "terminos" | "codigo";

const SLUGS: LegalSlug[] = ["privacidad", "terminos", "codigo"];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as LegalSlug)) notFound();
  const { lang } = await getT();
  const content = CONTENT[lang][slug as LegalSlug];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === "es" ? "Volver al inicio" : "Back to home"}</span>
      </Link>
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2">
        {lang === "es" ? "Legal" : "Legal"}
      </div>
      <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
        {content.title}
      </h1>
      <p className="text-ink-muted mt-3">
        {lang === "es" ? "Última actualización" : "Last updated"}: {content.updated}
      </p>

      <div className="mt-8 space-y-6 leading-relaxed text-ink">
        {content.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-semibold text-lg tracking-tight mb-2">{s.heading}</h2>
            {s.body.split("\n\n").map((p, j) => (
              <p key={j} className="text-ink-muted mb-3">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-12 bg-paper-subtle border border-line rounded-2xl p-5 text-sm text-ink-muted">
        {lang === "es"
          ? "¿Preguntas? Escríbenos a "
          : "Questions? Email "}
        <a href="mailto:hola@telos.foundation" className="text-brand hover:underline">
          hola@telos.foundation
        </a>
      </div>
    </div>
  );
}

const CONTENT: Record<"es" | "en", Record<LegalSlug, { title: string; updated: string; sections: { heading: string; body: string }[] }>> = {
  es: {
    privacidad: {
      title: "Política de privacidad",
      updated: "14 de junio de 2026",
      sections: [
        {
          heading: "Qué recopilamos",
          body:
            "Cuando donas o postulas un negocio, guardamos tu email para enviarte confirmaciones y un link de acceso a tu portal. Si eres una agencia, también guardamos tu nombre, ciudad y datos de contacto profesional.\n\nSi votas por un postulado, guardamos un hash de tu IP + la fecha para evitar votos duplicados. Nunca guardamos la IP completa.",
        },
        {
          heading: "Qué publicamos",
          body:
            "En el libro mayor público mostramos: monto, fecha, destino, y nombre del donante (o «Anónimo» si activaste esa opción). Tu email nunca se publica.\n\nLas postulaciones de negocios incluyen nombre, ciudad, categoría y necesidad. La dirección física y los datos del postulante quedan privados.",
        },
        {
          heading: "Quién más ve tus datos",
          body:
            "Nadie. No vendemos ni compartimos información con terceros. Los proveedores que usamos para operar (Neon, Cloudflare, Resend, Vercel) tienen acceso técnico mínimo y están sujetos a sus propias políticas de privacidad.",
        },
        {
          heading: "Tus derechos",
          body:
            "Puedes pedir que borremos tu información en cualquier momento escribiendo a hola@telos.foundation. Si has hecho aportes públicos, podemos anonimizar tu nombre pero el monto y la fecha permanecen visibles por transparencia.",
        },
      ],
    },
    terminos: {
      title: "Términos de uso",
      updated: "14 de junio de 2026",
      sections: [
        {
          heading: "Qué es Telos",
          body:
            "Telos es una fundación piloto que conecta donantes con agencias de servicios profesionales para apoyar a pequeños negocios en Colombia. No procesamos pagos automáticamente: las donaciones llegan por transferencia bancaria o cripto y se validan manualmente.",
        },
        {
          heading: "Sobre las donaciones",
          body:
            "El 100% de cada donación validada se asigna a servicios para negocios. Telos no cobra comisión. Los costos operativos se financian aparte.\n\nEn esta fase piloto NO emitimos certificados con beneficio tributario. Si esto cambia, lo anunciaremos públicamente.",
        },
        {
          heading: "Sobre los negocios postulados",
          body:
            "Cualquier persona puede postular un negocio. Telos verifica la existencia del negocio antes de aprobarlo. Los más votados por la comunidad pasan a evaluación de necesidad y match con agencia.",
        },
        {
          heading: "Sobre las agencias",
          body:
            "Las agencias son verificadas con cámara de comercio, RUT y referencias. Solo agencias activas pueden postular a RFPs. La selección final la hace el negocio, no Telos.",
        },
        {
          heading: "Limitación de responsabilidad",
          body:
            "Telos no garantiza el éxito comercial de los negocios apoyados ni la calidad final del trabajo de las agencias. Hacemos due diligence pero no somos responsables de disputas entre las partes.",
        },
      ],
    },
    codigo: {
      title: "Código de conducta",
      updated: "14 de junio de 2026",
      sections: [
        {
          heading: "Nuestros principios",
          body:
            "Telos opera sobre tres principios no negociables: (1) transparencia total en el flujo del dinero, (2) cero comisión sobre las donaciones, (3) tratar a cada negocio postulado con dignidad — sin importar su tamaño, formalidad o ciudad.",
        },
        {
          heading: "Para donantes",
          body:
            "No prometemos lo que no podemos cumplir. Si donas hoy y validamos tu comprobante mañana, lo verás en el libro mayor. Si rechazamos un aporte (por ejemplo, si no podemos confirmar la transferencia), te explicamos por qué.",
        },
        {
          heading: "Para agencias",
          body:
            "Las propuestas a RFPs son públicas. No hacemos invitaciones a dedo: si tu agencia está vetada en la categoría, recibes el aviso. Las tarifas son auditables. Esperamos honestidad sobre alcance, costos y plazos.",
        },
        {
          heading: "Para postulantes y negocios",
          body:
            "No pedimos formalización legal (RUT, cámara) como requisito. El objetivo de Telos es justamente apoyar negocios informales o de transición. La verificación es por existencia, no por papeleo.",
        },
        {
          heading: "Reportes",
          body:
            "Si ves algo que no cumpla con estos principios, escríbenos a hola@telos.foundation. Tomamos cada reporte en serio.",
        },
      ],
    },
  },
  en: {
    privacidad: {
      title: "Privacy policy",
      updated: "June 14, 2026",
      sections: [
        {
          heading: "What we collect",
          body:
            "When you donate or nominate a business, we store your email to send you confirmations and a magic link to your portal. If you're an agency, we also store your name, city and professional contact info.\n\nIf you vote on a nominee, we store a hash of your IP + the date to prevent duplicate votes. We never store your full IP.",
        },
        {
          heading: "What we publish",
          body:
            "In the public ledger we show: amount, date, destination, and donor name (or \"Anonymous\" if you toggled that option). Your email is never published.\n\nBusiness nominations include name, city, category and need. Physical address and the nominator's info stay private.",
        },
        {
          heading: "Who else sees your data",
          body:
            "No one. We don't sell or share information with third parties. The vendors we use to operate (Neon, Cloudflare, Resend, Vercel) have minimal technical access and are subject to their own privacy policies.",
        },
        {
          heading: "Your rights",
          body:
            "You can request deletion of your information at any time by emailing hola@telos.foundation. If you've made public contributions, we can anonymize your name but the amount and date remain visible for transparency.",
        },
      ],
    },
    terminos: {
      title: "Terms of use",
      updated: "June 14, 2026",
      sections: [
        {
          heading: "What Telos is",
          body:
            "Telos is a pilot foundation connecting donors with professional service agencies to support small businesses in Colombia. We don't process payments automatically: donations arrive via bank transfer or crypto and are validated manually.",
        },
        {
          heading: "About donations",
          body:
            "100% of every validated donation is allocated to services for businesses. Telos charges no commission. Operating costs are funded separately.\n\nIn this pilot phase we do NOT issue tax-deduction certificates. If this changes, we'll announce it publicly.",
        },
        {
          heading: "About nominated businesses",
          body:
            "Anyone can nominate a business. Telos verifies the business exists before approving. The most upvoted by the community move to needs assessment and agency match.",
        },
        {
          heading: "About agencies",
          body:
            "Agencies are verified via chamber of commerce, tax ID and references. Only active agencies can bid on RFPs. The final selection is made by the business, not Telos.",
        },
        {
          heading: "Limitation of liability",
          body:
            "Telos does not guarantee commercial success for supported businesses or the final quality of agency work. We do due diligence but are not responsible for disputes between parties.",
        },
      ],
    },
    codigo: {
      title: "Code of conduct",
      updated: "June 14, 2026",
      sections: [
        {
          heading: "Our principles",
          body:
            "Telos operates on three non-negotiable principles: (1) total transparency in money flow, (2) zero commission on donations, (3) treating every nominated business with dignity — regardless of size, formality, or city.",
        },
        {
          heading: "For donors",
          body:
            "We don't promise what we can't deliver. If you donate today and we validate your proof tomorrow, you'll see it in the ledger. If we reject a contribution (e.g., we can't confirm the transfer), we explain why.",
        },
        {
          heading: "For agencies",
          body:
            "RFP proposals are public. We don't hand-pick: if your agency is vetted in the category, you get notified. Rates are auditable. We expect honesty about scope, costs and timelines.",
        },
        {
          heading: "For nominators and businesses",
          body:
            "We don't ask for legal formalization (tax ID, chamber) as a requirement. Telos's purpose is precisely to support informal or transitioning businesses. Verification is by existence, not paperwork.",
        },
        {
          heading: "Reports",
          body:
            "If you see something that doesn't meet these principles, write to hola@telos.foundation. We take every report seriously.",
        },
      ],
    },
  },
};
