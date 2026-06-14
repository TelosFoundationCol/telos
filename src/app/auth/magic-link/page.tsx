import Link from "next/link";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { MagicLinkForm } from "@/components/magic-link-form";

export default async function MagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const { t, lang } = await getT();
  const next = sp.next ?? "/portal/donante";
  const isAgency = next.startsWith("/portal/agencia");

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t("login.back")}</span>
      </Link>
      <MagicLinkForm next={next} />

      {isAgency && (
        <div className="mt-10 border-t border-line pt-6">
          <div className="text-[10px] uppercase tracking-wider text-ink-subtle mb-2">
            {lang === "es" ? "¿Aún no eres parte de Telos?" : "Not in Telos yet?"}
          </div>
          <p className="text-sm text-ink-muted">
            {lang === "es"
              ? "Si tu agencia no está vetada todavía, postula aquí. Te enviamos un link mágico para entrar a tu portal mientras revisamos."
              : "If your agency isn't vetted yet, apply here. We'll send a magic link so you can enter your portal while we review."}
          </p>
          <Link
            href="/agencias/aplicar"
            className="mt-3 inline-flex items-center gap-2 border border-line bg-paper rounded-full px-4 py-2 text-sm font-medium hover:bg-paper-sunken"
          >
            <Briefcase className="w-4 h-4" />
            <span>{lang === "es" ? "Postular mi agencia" : "Apply my agency"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
