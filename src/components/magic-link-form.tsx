"use client";

import { useState } from "react";
import { Briefcase, HandCoins, Mail, MailCheck, Send, ShieldCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/context";

type PortalKind = "donor" | "agency" | "admin";

function portalFromNext(next: string): PortalKind {
  if (next.startsWith("/admin")) return "admin";
  if (next.startsWith("/portal/agencia")) return "agency";
  return "donor";
}

const portalCopy: Record<PortalKind, { titleKey: string; subKey: string; icon: React.ComponentType<{ className?: string }> }> = {
  donor: { titleKey: "login.title.donor", subKey: "login.sub.donor", icon: HandCoins },
  agency: { titleKey: "login.title.agency", subKey: "login.sub.agency", icon: Briefcase },
  admin: { titleKey: "login.title.admin", subKey: "login.sub.admin", icon: ShieldCheck },
};

export function MagicLinkForm({ next }: { next: string }) {
  const { t } = useT();
  const portal = portalFromNext(next);
  const copy = portalCopy[portal];
  const PortalIcon = copy.icon;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!/.+@.+\..+/.test(email) || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) throw new Error("rate-limited");
      if (!res.ok) throw new Error("send-failed");
      setSent(true);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg === "rate-limited" ? "Demasiados intentos. Espera unos minutos." : t("common.error"));
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-subtle mb-2 inline-flex items-center gap-2">
          <PortalIcon className="w-3.5 h-3.5" />
          {t(copy.titleKey)}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-5">
          <MailCheck className="w-5 h-5" />
        </div>
        <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">{t("login.sent.t")}</h1>
        <p className="text-ink-muted mt-3">
          {t("login.sent.p")} <span className="text-ink font-medium">{email}</span>. {t("login.sent.p2")}
        </p>
        <div className="mt-6 flex items-center gap-3 text-sm">
          <button onClick={() => send()} className="text-ink-muted hover:text-ink underline">
            {t("login.resend")}
          </button>
          <span className="text-ink-faint">·</span>
          <button
            onClick={() => {
              setSent(false);
              setEmail("");
            }}
            className="text-ink-muted hover:text-ink underline"
          >
            {t("login.change")}
          </button>
        </div>
        <input type="hidden" name="next" value={next} />
      </div>
    );
  }

  return (
    <>
      <div className="text-xs uppercase tracking-wider text-ink-subtle mb-3 inline-flex items-center gap-2">
        <PortalIcon className="w-3.5 h-3.5" />
        {portal === "donor"
          ? t("nav.portal.donor")
          : portal === "agency"
            ? t("nav.portal.agency")
            : t("nav.portal.admin")}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-paper-sunken flex items-center justify-center mb-5">
        <Mail className="w-5 h-5 text-ink-muted" />
      </div>
      <h1 className="serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">{t(copy.titleKey)}</h1>
      <p className="text-ink-muted mt-3">{t(copy.subKey)}</p>

      <div className="mt-8 space-y-3">
        <div>
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </div>
        <Button onClick={send} disabled={sending || !/.+@.+\..+/.test(email)} className="w-full py-3.5 rounded-xl">
          <Send className="w-4 h-4" />
          <span>{t("login.send")}</span>
        </Button>
        {error && <div className="text-sm text-rose-600">{error}</div>}
      </div>

      <div className="mt-6 bg-paper-subtle border border-line rounded-xl p-4 text-xs text-ink-muted">
        {t("login.note")}
      </div>
    </>
  );
}
