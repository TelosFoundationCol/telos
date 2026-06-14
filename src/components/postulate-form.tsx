"use client";

import { useState } from "react";
import { ArrowRight, Check, Send, Youtube } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { TurnstileGate } from "@/components/turnstile";
import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3 | 4 | 5;

const CATEGORIES = ["marketing", "tech", "accounting", "legal", "export"] as const;
const RELATIONS = ["owner", "family", "customer", "friend", "other"] as const;

export function PostulateForm() {
  const { t } = useT();
  const [step, setStep] = useState<Step>(1);
  const [submitId, setSubmitId] = useState<string | null>(null);

  const [data, setData] = useState({
    name: "",
    city: "",
    address: "",
    yearsOperating: "",
    category: "marketing" as (typeof CATEGORIES)[number],
    youtubeUrl: "",
    story: "",
    need: "",
    why: "",
    postulantName: "",
    postulantEmail: "",
    postulantRelation: "owner" as (typeof RELATIONS)[number],
    honeypot: "",
  });

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  async function handleSubmit() {
    if (submitting) return;
    if (!turnstileToken || !confirmChecked) return;
    if (data.honeypot) return; // bot
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/postulados", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? "submit-failed");
      setSubmitId(json.id);
      setStep(5);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Stepper */}
      <div
        className={`mt-8 sm:mt-10 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-thin pb-1 ${step === 5 ? "opacity-40 pointer-events-none" : ""}`}
      >
        <StepDot n={1} active={step >= 1} label={t("postular.s1")} />
        <Line />
        <StepDot n={2} active={step >= 2} label={t("postular.s2")} />
        <Line />
        <StepDot n={3} active={step >= 3} label={t("postular.s3")} />
        <Line />
        <StepDot n={4} active={step >= 4} label={t("postular.s4")} />
      </div>

      {step === 1 && (
        <div className="mt-8 sm:mt-10 space-y-4">
          <div>
            <Label>{t("postular.f.name")}</Label>
            <Input value={data.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej: Panadería La Esperanza" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>{t("postular.f.city")}</Label>
              <Input value={data.city} onChange={(e) => set("city", e.target.value)} placeholder="Ej: Medellín, Antioquia" />
            </div>
            <div>
              <Label>{t("postular.f.years")}</Label>
              <Input
                type="number"
                value={data.yearsOperating}
                onChange={(e) => set("yearsOperating", e.target.value)}
                placeholder="8"
                className="tabular"
              />
            </div>
          </div>
          <div>
            <Label>{t("postular.f.address")}</Label>
            <Input
              value={data.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Ej: Calle 45 #23-12, barrio Belén"
            />
            <div className="text-xs text-ink-subtle mt-1">{t("postular.f.addressnote")}</div>
          </div>
          <div>
            <Label>{t("postular.f.category")}</Label>
            <Select
              value={data.category}
              onChange={(e) => set("category", e.target.value as (typeof CATEGORIES)[number])}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>
              {t("postular.f.video")}{" "}
              <span className="text-ink-faint font-normal">{t("postular.f.optional")}</span>
            </Label>
            <div className="relative">
              <Youtube className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
              <Input
                type="url"
                value={data.youtubeUrl}
                onChange={(e) => set("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="pl-10"
              />
            </div>
            <div className="text-xs text-ink-subtle mt-1">{t("postular.f.videonote")}</div>
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            value={data.honeypot}
            onChange={(e) => set("honeypot", e.target.value)}
          />
          <Button
            onClick={() => setStep(2)}
            disabled={!data.name || !data.city || !data.address || !data.yearsOperating}
            className="w-full py-3.5 rounded-xl"
          >
            <span>{t("don.next")}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 sm:mt-10 space-y-4">
          <div>
            <Label>{t("postular.f.story")}</Label>
            <Textarea rows={4} value={data.story} onChange={(e) => set("story", e.target.value)} />
          </div>
          <div>
            <Label>{t("postular.f.need")}</Label>
            <Textarea rows={3} value={data.need} onChange={(e) => set("need", e.target.value)} />
          </div>
          <div>
            <Label>{t("postular.f.why")}</Label>
            <Textarea rows={3} value={data.why} onChange={(e) => set("why", e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={data.story.length < 20 || data.need.length < 10}
              className="flex-[2] py-3 rounded-xl"
            >
              {t("don.next")}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 sm:mt-10 space-y-4">
          <div className="bg-paper-subtle border border-line rounded-xl p-3 text-xs text-ink-muted">
            {t("postular.contact.note")}
          </div>
          <div>
            <Label>{t("postular.f.fullname")}</Label>
            <Input value={data.postulantName} onChange={(e) => set("postulantName", e.target.value)} />
          </div>
          <div>
            <Label>{t("postular.f.email")}</Label>
            <Input
              type="email"
              value={data.postulantEmail}
              onChange={(e) => set("postulantEmail", e.target.value)}
            />
          </div>
          <div>
            <Label>{t("postular.f.relation")}</Label>
            <Select
              value={data.postulantRelation}
              onChange={(e) => set("postulantRelation", e.target.value as (typeof RELATIONS)[number])}
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`postular.rel.${r}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!data.postulantName || !/.+@.+\..+/.test(data.postulantEmail)}
              className="flex-[2] py-3 rounded-xl"
            >
              {t("don.next")}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 sm:mt-10 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer bg-paper-subtle border border-line rounded-xl p-4">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-line accent-ink mt-0.5 shrink-0"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
            />
            <span className="text-sm text-ink-muted">{t("postular.f.confirm")}</span>
          </label>

          <div
            onClick={() => !verified && setShowCaptcha(true)}
            className={`border border-line rounded-xl p-4 flex items-center gap-3 bg-paper ${verified ? "" : "cursor-pointer hover:bg-paper-subtle"}`}
          >
            {verified ? (
              <>
                <div className="w-6 h-6 rounded bg-brand text-paper flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-brand-ink">{t("ts.ok")}</div>
                  <div className="text-xs text-ink-subtle">Cloudflare Turnstile</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded border-2 border-line shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">{t("postular.tstile")}</div>
                  <div className="text-xs text-ink-subtle">Cloudflare Turnstile · {t("postular.privacy")}</div>
                </div>
              </>
            )}
            <div className="ml-auto text-xs text-ink-faint">CF</div>
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!verified || !confirmChecked || submitting}
              className="flex-[2] py-3 rounded-xl"
            >
              <Send className="w-4 h-4" />
              <span>{t("postular.submit")}</span>
            </Button>
          </div>
        </div>
      )}

      {step === 5 && submitId && (
        <div className="mt-8 sm:mt-10">
          <div className="bg-brand-soft border border-brand-border rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand text-paper flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="serif text-3xl mt-5">{t("postular.ok.t")}</h2>
            <p className="text-ink-muted mt-2 max-w-md mx-auto">
              {t("postular.ok.p")}{" "}
              <span className="font-mono tabular text-ink">PS-{submitId.slice(0, 8)}</span>
            </p>
            <div className="mt-6">
              <a
                href="/postulados"
                className="inline-flex items-center gap-2 bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium"
              >
                <span>{t("postular.ok.cta")}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {showCaptcha && (
        <TurnstileGate
          onClose={() => setShowCaptcha(false)}
          onVerified={(token) => {
            setTurnstileToken(token);
            setVerified(true);
            setShowCaptcha(false);
          }}
        />
      )}
    </>
  );
}

function StepDot({ n, active, label }: { n: number; active: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 shrink-0 ${active ? "text-ink font-medium" : "text-ink-faint"}`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
          active ? "bg-ink text-paper" : "bg-paper-sunken text-ink-muted"
        }`}
      >
        {n}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Line() {
  return <div className="h-px w-4 sm:w-8 bg-line shrink-0" />;
}
