import type { ThemeMode } from "../../../lib/theme";
import { useTheme } from "../hooks/useTheme";

const modes: { id: ThemeMode; label: string; short: string }[] = [
  { id: "light", label: "Tema claro", short: "Claro" },
  { id: "dark", label: "Tema oscuro", short: "Oscuro" },
  { id: "system", label: "Igual que el sistema", short: "Auto" },
];

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <div
      className="flex w-full max-w-sm flex-col gap-1.5 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-md shadow-black/10 backdrop-blur-md dark:shadow-black/35 sm:max-w-none sm:min-w-[10.5rem]"
      role="group"
      aria-label="Tema visual de la página"
    >
      <p className="px-2 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        Tema
      </p>
      <div className="flex gap-0.5">
        {modes.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={active}
              aria-label={m.label}
              title={m.label}
              className={`min-h-9 min-w-0 flex-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                active
                  ? "bg-accent-muted text-accent shadow-inner"
                  : "text-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              {m.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
