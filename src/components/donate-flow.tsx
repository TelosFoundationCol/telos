"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Bitcoin,
  Building2,
  Check,
  Copy,
  EyeOff,
  FileText,
  Info,
  LineChart,
  Send,
  Smartphone,
  Upload,
} from "lucide-react";
import { useT } from "@/lib/i18n/context";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Currency = "USD" | "COP";
type Destination = "general" | "business" | "category";
type Region = "co" | "intl";

const PRESETS: Record<Currency, number[]> = {
  USD: [25, 100, 250, 500],
  COP: [100_000, 400_000, 1_000_000, 2_000_000],
};

function genRef() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 999_999).toString().padStart(6, "0");
  return `TX-${year}-${rand}`;
}

export function DonateFlow({ earmarkBusinessId }: { earmarkBusinessId: string | null }) {
  const { t, lang } = useT();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState<number>(100);
  const [destination, setDestination] = useState<Destination>(
    earmarkBusinessId ? "business" : "general",
  );
  const [region, setRegion] = useState<Region>("co");
  const refCode = useMemo(() => genRef(), []);

  const [proof, setProof] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live-update the right-rail summary panel
  useEffect(() => {
    const amtEl = document.getElementById("sum-amount");
    const svcEl = document.getElementById("sum-services");
    const fmt = currency === "USD"
      ? `USD $${amount.toFixed(2)}`
      : `COP ${Math.round(amount).toLocaleString("es-CO")}`;
    if (amtEl) amtEl.textContent = fmt;
    if (svcEl) svcEl.textContent = fmt;
  }, [amount, currency]);

  function pickFile(f: File | null) {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert(lang === "es" ? "Archivo muy grande. Máximo 5MB." : "File too large. Max 5MB.");
      return;
    }
    setProof(f);
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!proof || !/.+@.+\..+/.test(email)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Step 1: get presigned upload URL
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reference: refCode,
          filename: proof.name,
          contentType: proof.type,
        }),
      });
      if (!presign.ok) throw new Error("presign-failed");
      const { url, key } = (await presign.json()) as { url: string; key: string };

      // Step 2: upload directly to R2
      const upload = await fetch(url, {
        method: "PUT",
        headers: { "content-type": proof.type },
        body: proof,
      });
      if (!upload.ok) throw new Error("upload-failed");

      // Step 3: create donation record
      const create = await fetch("/api/donations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reference: refCode,
          email,
          donorName: anonymous ? null : donorName || null,
          anonymous,
          currency,
          amountCents: Math.round(amount * 100),
          destinationKind: destination,
          destinationBusinessId: destination === "business" ? earmarkBusinessId : null,
          proofObjectKey: key,
          bankRef: bankRef || null,
          transferDate: transferDate || null,
          message: message || null,
        }),
      });
      if (!create.ok) {
        const j = await create.json().catch(() => ({}));
        throw new Error(j.error ?? "create-failed");
      }
      setSubmittedRef(refCode);
      setStep(5);
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Stepper */}
      <div
        className={`mt-8 sm:mt-10 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-thin pb-1 ${step === 5 ? "opacity-40" : ""}`}
      >
        <Dot n={1} active={step >= 1} label={t("don.s1")} />
        <Line />
        <Dot n={2} active={step >= 2} label={t("don.s2")} />
        <Line />
        <Dot n={3} active={step >= 3} label={t("don.s3")} />
        <Line />
        <Dot n={4} active={step >= 4} label={t("don.s4")} />
      </div>

      {/* Step 1: amount */}
      {step === 1 && (
        <div className="mt-8 sm:mt-10">
          <Label>{t("don.amount.label")}</Label>
          <div className="flex items-center gap-2 mb-4 text-xs">
            <CurrencyBtn label="USD" active={currency === "USD"} onClick={() => setCurrency("USD")} />
            <CurrencyBtn label="COP" active={currency === "COP"} onClick={() => setCurrency("COP")} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {PRESETS[currency].map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={`border rounded-xl py-2.5 text-sm font-medium tabular hover:border-ink hover:bg-paper-subtle ${
                  amount === p ? "border-ink bg-paper-subtle" : "border-line bg-paper"
                }`}
              >
                {currency === "USD" ? `$${p}` : `COP ${p.toLocaleString("es-CO")}`}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
              {currency === "USD" ? "$" : "COP"}
            </span>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full border border-line rounded-xl pl-9 pr-4 py-3.5 text-2xl tabular focus-ring bg-paper"
              placeholder="100"
            />
          </div>
          <div className="text-xs text-ink-subtle text-right mt-3 tabular">
            {currency === "USD"
              ? `≈ COP ${Math.round(amount * 4000).toLocaleString("es-CO")}`
              : `≈ USD $${(amount / 4000).toFixed(2)}`}
          </div>
          <Button onClick={() => setStep(2)} disabled={amount <= 0} className="mt-6 w-full py-3.5 rounded-xl">
            {t("don.next")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: destination */}
      {step === 2 && (
        <div className="mt-8 sm:mt-10 space-y-4">
          <Label>{t("don.dest.label")}</Label>
          <div className="space-y-2">
            {(
              [
                ["general", t("don.dest.general"), t("don.dest.generalsub")],
                ["business", t("don.dest.specific"), t("don.dest.specificsub")],
                ["category", t("don.dest.category"), t("don.dest.categorysub")],
              ] as const
            ).map(([key, label, sub]) => (
              <label
                key={key}
                className={`block border rounded-xl p-4 cursor-pointer ${
                  destination === key ? "border-ink bg-paper-subtle" : "border-line hover:bg-paper-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="dest"
                  className="hidden"
                  checked={destination === key}
                  onChange={() => setDestination(key)}
                />
                <div className="font-medium">{label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{sub}</div>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button onClick={() => setStep(3)} className="flex-[2] py-3 rounded-xl">
              {t("don.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: transfer instructions */}
      {step === 3 && (
        <div className="mt-8 sm:mt-10">
          <div className="text-sm font-medium mb-1">{t("don.tr.label")}</div>
          <p className="text-sm text-ink-muted mb-4">{t("don.tr.sub")}</p>

          <div className="bg-paper-subtle border border-line rounded-xl p-4 mb-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-ink-subtle uppercase tracking-wider">{t("don.tr.ref")}</div>
              <div className="font-mono text-lg tabular mt-0.5">{refCode}</div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(refCode)}
              className="text-xs border border-line bg-paper rounded-full px-2.5 py-1 hover:bg-paper-sunken inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t("don.tr.copy")}</span>
            </button>
          </div>
          <p className="text-xs text-ink-muted mb-4 -mt-1">{t("don.tr.refnote")}</p>

          <div className="flex items-center gap-1 mb-3 text-xs">
            <RegionBtn label="🇨🇴 Colombia" active={region === "co"} onClick={() => setRegion("co")} />
            <RegionBtn label={`🌎 ${t("don.tr.intl")}`} active={region === "intl"} onClick={() => setRegion("intl")} />
          </div>

          {region === "co" ? (
            <div className="space-y-3">
              <TransferCard
                icon={<Building2 className="w-4 h-4" />}
                title={`Bancolombia · ${t("don.tr.savings")}`}
                value="691-29384-72-1"
                holder={`${t("don.tr.holder")}: Fundación Telos`}
              />
              <TransferCard
                icon={<Smartphone className="w-4 h-4" />}
                title="Nequi"
                value="301 456 7890"
                holder={`${t("don.tr.holder")}: Fundación Telos`}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <TransferCard
                icon={<Bitcoin className="w-4 h-4" />}
                title={`USDC · ${t("don.tr.polygon")}`}
                value="0x7Bf8E2bE3f1fA0c84B2D8E5Fb19c0d4A2E1e7d2"
                holder={t("don.tr.polygonnote")}
                breakAll
              />
              <div className="border border-line rounded-xl p-4">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <Banknote className="w-4 h-4" />
                  Wire / ACH
                </div>
                <div className="text-sm text-ink-muted">{t("don.tr.wirenote")}</div>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button onClick={() => setStep(4)} className="flex-[2] py-3 rounded-xl">
              {t("don.tr.next")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: proof upload */}
      {step === 4 && (
        <div className="mt-8 sm:mt-10">
          <div className="text-sm font-medium mb-1">{t("don.up.label")}</div>
          <p className="text-sm text-ink-muted mb-4">{t("don.up.sub")}</p>

          <label
            className="block border-2 border-dashed border-line rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:bg-paper-subtle transition"
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-paper-subtle", "border-ink");
            }}
            onDragLeave={(e) => e.currentTarget.classList.remove("bg-paper-subtle", "border-ink")}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-paper-subtle", "border-ink");
              pickFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {!proof ? (
              <>
                <div className="w-10 h-10 rounded-full bg-paper-sunken text-ink-muted flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="mt-3 font-medium">{t("don.up.dz1")}</div>
                <div className="text-xs text-ink-subtle mt-1">{t("don.up.dz2")}</div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="mt-3 font-medium">{proof.name}</div>
                <div className="text-xs text-ink-subtle mt-1">
                  {(proof.size / 1024).toFixed(0)} KB
                </div>
                <div className="text-xs text-brand mt-2">{t("don.up.change")}</div>
              </>
            )}
          </label>

          <div className="space-y-3 mt-4">
            <div>
              <Label>{t("don.up.email")}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
              <div className="text-xs text-ink-subtle mt-1">{t("don.up.emailnote")}</div>
            </div>
            <div>
              <Label>{lang === "es" ? "Tu nombre (opcional)" : "Your name (optional)"}</Label>
              <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder={lang === "es" ? "Nombre completo" : "Full name"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>
                  {t("don.up.bankref")} <span className="text-ink-faint font-normal">{t("don.up.opt")}</span>
                </Label>
                <Input value={bankRef} onChange={(e) => setBankRef(e.target.value)} placeholder="Ej: 0000123456" className="tabular" />
              </div>
              <div>
                <Label>{t("don.up.date")}</Label>
                <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className="tabular" />
              </div>
            </div>
            <div>
              <Label>
                {t("don.up.msg")} <span className="text-ink-faint font-normal">{t("don.up.opt")}</span>
              </Label>
              <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <label
              className={`flex items-start gap-3 cursor-pointer border rounded-xl p-4 hover:bg-paper-subtle ${
                anonymous ? "border-ink bg-paper-subtle" : "border-line"
              }`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-line accent-ink mt-0.5 shrink-0"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <div className="text-sm">
                <div className="font-medium flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  {t("don.up.anon")}
                </div>
                <div className="text-xs text-ink-muted mt-0.5">{t("don.up.anonnote")}</div>
              </div>
            </label>
          </div>

          {submitError && <div className="mt-3 text-sm text-rose-600">{submitError}</div>}

          <div className="flex gap-2 mt-6">
            <Button variant="secondary" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl">
              {t("don.back")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !proof || !/.+@.+\..+/.test(email)}
              className="flex-[2] py-3 rounded-xl"
            >
              <Send className="w-4 h-4" />
              <span>{t("don.up.submit")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: success */}
      {step === 5 && submittedRef && (
        <div className="mt-8 sm:mt-10">
          <div className="bg-brand-soft border border-brand-border rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-brand text-paper flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="serif text-3xl mt-5">{t("don.thx")}</h2>
            <p className="text-ink-muted mt-2 max-w-md mx-auto">{t("don.thx.p")}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{t("don.thx.status")}</span>
              <span>·</span>
              <span className="font-mono tabular">{submittedRef}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
              <a
                href="/portal/donante"
                className="inline-flex items-center gap-2 bg-ink text-paper rounded-full px-4 py-2 text-sm font-medium"
              >
                <span>{t("don.thx.cta")}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/transparencia"
                className="inline-flex items-center gap-2 border border-line bg-paper rounded-full px-4 py-2 text-sm hover:bg-paper-sunken"
              >
                <LineChart className="w-4 h-4" />
                <span>{t("don.thx.ledger")}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ n, active, label }: { n: number; active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${active ? "text-ink font-medium" : "text-ink-faint"}`}>
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
function CurrencyBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full border ${active ? "border-ink bg-ink text-paper" : "border-line hover:bg-paper-sunken"}`}
    >
      {label}
    </button>
  );
}
function RegionBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border ${active ? "border-ink bg-ink text-paper" : "border-line hover:bg-paper-sunken"}`}
    >
      {label}
    </button>
  );
}
function TransferCard({
  icon,
  title,
  value,
  holder,
  breakAll,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  holder: string;
  breakAll?: boolean;
}) {
  return (
    <div className="border border-line rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-medium">
          {icon}
          <span>{title}</span>
        </div>
        <button
          onClick={() => navigator.clipboard?.writeText(value)}
          className="text-xs text-ink-muted hover:text-ink"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className={`text-sm text-ink font-mono ${breakAll ? "break-all" : "tabular"}`}>{value}</div>
      <div className="text-xs text-ink-muted mt-1">{holder}</div>
    </div>
  );
}
