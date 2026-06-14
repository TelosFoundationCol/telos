import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("bg-paper border border-line rounded-2xl", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-5 border-b border-line flex items-start sm:items-center justify-between gap-3 flex-wrap",
        className,
      )}
    >
      <div>
        <div className="text-sm font-medium">{title}</div>
        {subtitle ? (
          <div className="text-xs text-ink-subtle mt-0.5">{subtitle}</div>
        ) : null}
      </div>
      {right}
    </div>
  );
}

export function StatStrip({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}

export function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="bg-paper p-5">
      <div className="text-xs text-ink-subtle uppercase tracking-wider">{label}</div>
      <div className="serif text-3xl mt-2 tabular">{value}</div>
      {sub ? <div className="text-xs text-ink-muted mt-1">{sub}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "amber" | "blue" | "rose";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-sunken text-ink-muted border-line",
    brand: "bg-brand-soft text-brand-ink border-brand-border",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-full",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
