import { Link } from "@tanstack/react-router";
import {
  CalendarRange,
  LayoutGrid,
  Mail,
  Menu,
  ListChecks,
  Settings,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: ListChecks },
  { to: "/planner", label: "Task Planner", icon: CalendarRange },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 px-3 text-sm">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-fog transition-colors hover:bg-panel2/60 hover:text-mist"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-lg px-3 py-2.5 bg-panel2 text-paper font-medium ring-1 ring-line",
          }}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="grid size-8 place-items-center rounded-[10px] bg-accent font-display text-sm font-semibold text-accent-foreground">
        M
      </div>
      <div className="leading-none">
        <div className="font-display text-[15px] font-semibold text-paper">Meridian</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-fog">Workplace AI</div>
      </div>
    </div>
  );
}

export function AppShell({
  crumb,
  children,
}: {
  crumb: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink font-sans text-mist">
      <div className="grid grid-cols-1 md:grid-cols-[236px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden flex-col border-r border-line md:sticky md:top-0 md:flex md:h-screen">
          <Brand />
          <NavList />
          <div className="p-3">
            <div className="panel-card p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-fog">
                <span className="size-1.5 rounded-full bg-positive soft-pulse" />
                Model online
              </div>
              <p className="mt-3 text-xs leading-relaxed text-fog">
                Outputs are saved to this device only.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/80"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-line bg-panel">
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-9 place-items-center rounded-lg text-fog hover:text-paper"
                >
                  <X className="size-4" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 px-5 py-6 sm:px-8 lg:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-fog">
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid size-9 place-items-center rounded-lg ring-1 ring-line text-fog hover:text-paper md:hidden"
              >
                <Menu className="size-4" />
              </button>
              <span className="hidden text-mist sm:inline">Workspace</span>
              <span className="hidden text-line sm:inline">/</span>
              <span className="font-medium text-paper">{crumb}</span>
            </div>
            <div className="grid size-8 place-items-center rounded-full bg-panel2 font-display text-xs text-paper ring-1 ring-line">
              AR
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
