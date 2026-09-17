import { AlertTriangle, Check, Copy, RefreshCw, Pencil, Save } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 text-[11px] leading-relaxed text-fog ${
        compact ? "" : "border-t border-line pt-3"
      }`}
    >
      <AlertTriangle className="mt-px size-4 shrink-0 text-accent" aria-hidden />
      <span>
        AI may make errors and outputs are not automatically verified. Review important information
        before acting on it, avoid entering confidential, private or sensitive data, and remember
        that you remain responsible for any decision you make from this output.
      </span>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
      <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-fog">{description}</p>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-fog">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-fog/70">{hint}</span>}
    </label>
  );
}

export function GenerateButton({
  loading,
  label,
  onClick,
}: {
  loading: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <RefreshCw className="size-4 animate-spin" /> : null}
      {loading ? "Generating…" : label}
    </button>
  );
}

export function CopyButton({ getText }: { getText: () => string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          setDone(false);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-mist ring-1 ring-line transition-colors hover:bg-panel2"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function ToolbarButton({
  icon,
  children,
  onClick,
  disabled,
}: {
  icon: "edit" | "regen" | "save";
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = icon === "edit" ? Pencil : icon === "save" ? Save : RefreshCw;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-mist ring-1 ring-line transition-colors hover:bg-panel2 disabled:opacity-50"
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl bg-danger/10 p-4 ring-1 ring-danger/30">
      <div className="flex items-start gap-2 text-sm text-paper">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
        <div>
          <p>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 rounded-md px-2.5 py-1 text-xs text-mist ring-1 ring-line hover:bg-panel2"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingLines({ lines = 4 }: { lines?: number }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/5", "w-2/3", "w-1/2"];
  return (
    <div className="space-y-2.5" aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-2.5 rounded-full bg-panel2 soft-pulse ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center">
      <p className="font-display text-sm text-paper">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[42ch] text-xs leading-relaxed text-fog">{body}</p>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
          : "rounded-full px-3 py-1.5 text-xs text-fog ring-1 ring-line transition-colors hover:text-mist"
      }
    >
      {children}
    </button>
  );
}
