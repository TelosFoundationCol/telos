"use client";

import { ChevronUp, Check, Loader, PlayCircle } from "lucide-react";
import { useState } from "react";
import type { Postulado } from "@/lib/db/schema";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { pickLocalized } from "@/lib/utils";
import { Pill } from "@/components/ui/card";
import { TurnstileGate } from "@/components/turnstile";

const VOTE_KEY = "telos.votes";
const VOTE_TTL_MS = 24 * 60 * 60 * 1000;

function readVotes(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VOTE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeVotes(v: Record<string, number>) {
  window.localStorage.setItem(VOTE_KEY, JSON.stringify(v));
}
function hasVoted(id: string): boolean {
  const all = readVotes();
  return !!all[id] && Date.now() - all[id] < VOTE_TTL_MS;
}

export function PostuladoCard({
  postulado: p,
  lang,
  initialVotes,
}: {
  postulado: Postulado;
  lang: Lang;
  initialVotes: number;
}) {
  const t = (k: string) => dictionaries[lang][k] ?? k;
  const [votes, setVotes] = useState(initialVotes);
  const [voted, setVoted] = useState(() => hasVoted(p.id));
  const [pending, setPending] = useState(false);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const inReview = p.status === "pending_review";
  const story = pickLocalized(p, "story", lang);
  const need = pickLocalized(p, "need", lang);

  async function submitVote(token: string) {
    setPending(true);
    try {
      const res = await fetch(`/api/postulados/${p.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ turnstileToken: token }),
      });
      if (!res.ok) throw new Error("vote-failed");
      const data = (await res.json()) as { votes: number };
      setVotes(data.votes);
      const all = readVotes();
      all[p.id] = Date.now();
      writeVotes(all);
      setVoted(true);
      setShowCaptcha(false);
      setTsToken(null);
    } catch (err) {
      console.error(err);
      alert(t("common.error"));
    } finally {
      setPending(false);
    }
  }

  function onClick() {
    if (inReview || voted || pending) return;
    setShowCaptcha(true);
  }

  return (
    <div className="bg-paper border border-line rounded-2xl p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-paper-sunken flex items-center justify-center text-2xl shrink-0">
          {p.emoji ?? "🌱"}
        </div>
        {inReview ? (
          <Pill tone="amber">
            <Loader className="w-2.5 h-2.5" />
            {t("post.review")}
          </Pill>
        ) : (
          <Pill tone="brand">
            <Check className="w-2.5 h-2.5" />
            {t("post.approved")}
          </Pill>
        )}
      </div>
      <div className="font-semibold tracking-tight text-lg">{p.name}</div>
      <div className="text-xs text-ink-muted mt-0.5">
        {p.city} · {t(`cat.${p.category}`)}
      </div>
      <p className="text-sm text-ink-muted mt-3 line-clamp-3">{story}</p>
      <div className="mt-3 text-xs">
        <span className="text-ink-subtle">{t("post.needs")}</span>{" "}
        <span className="text-ink">{need}</span>
      </div>
      {p.youtubeUrl && (
        <a
          href={p.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline self-start"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          {t("post.watchvideo")}
        </a>
      )}
      <div className="mt-auto pt-5 flex items-center justify-between gap-3 border-t border-line">
        <div className="text-xs text-ink-subtle leading-snug">
          {t("post.by")} <span className="text-ink">{p.postulantName}</span>
        </div>
        <button
          onClick={onClick}
          disabled={inReview || voted || pending}
          className={`inline-flex items-center gap-2 border rounded-full px-3 py-1.5 ${
            voted
              ? "bg-brand-soft text-brand-ink border-brand-border"
              : inReview
                ? "bg-paper text-ink-faint border-line cursor-not-allowed"
                : "bg-paper hover:bg-paper-subtle text-ink border-line"
          }`}
          title={voted ? t("post.voted") : inReview ? t("post.review") : t("post.vote")}
        >
          {voted ? (
            <Check className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
          <span className="text-sm font-medium tabular">{votes}</span>
        </button>
      </div>

      {showCaptcha && !voted && (
        <TurnstileGate
          onVerified={(token) => {
            setTsToken(token);
            submitVote(token);
          }}
          onClose={() => setShowCaptcha(false)}
        />
      )}
    </div>
  );
}
