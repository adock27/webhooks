import type { GameStatePayload } from "@shared/protocol";

type Props = {
  joined: boolean;
  ready: boolean;
  game: GameStatePayload | null;
  canPlay: boolean;
  guessValue: string;
  onGuessChange: (v: string) => void;
  onGuessSubmit: () => void;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
  onUnlockAudio: () => void;
  minN: number;
  maxN: number;
  guessValid: boolean;
  guessInRange: boolean;
};

const inputClass =
  "box-border min-h-11 w-full max-w-full rounded-xl border border-border bg-app px-4 py-2.5 text-base text-fg transition-colors hover:border-muted/50 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs";

export function PlayPanel({
  joined,
  ready,
  game,
  canPlay,
  guessValue,
  onGuessChange,
  onGuessSubmit,
  soundOn,
  onSoundChange,
  onUnlockAudio,
  minN,
  maxN,
  guessValid,
  guessInRange,
}: Props) {
  const inputDisabled = !joined || Boolean(game?.won) || !ready;
  const canSubmit = canPlay && guessInRange;
  const showOutOfRange =
    guessValid && !guessInRange && !inputDisabled && guessValue.trim() !== "";
  const showNeedInteger =
    guessValue.trim() !== "" && !guessValid && !inputDisabled;

  let guessHint = `Escribe un número entero entre ${minN} y ${maxN}.`;
  if (showOutOfRange) {
    guessHint = `Ese número está fuera del rango. Usa un valor entre ${minN} y ${maxN}.`;
  } else if (showNeedInteger) {
    guessHint = "Escribe solo números enteros, sin decimales ni letras.";
  }

  return (
    <section
      className={`mt-6 rounded-2xl border bg-surface p-5 shadow-lg shadow-black/20 transition-shadow duration-300 sm:p-6 ${
        canPlay
          ? "border-accent/60 shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_0_32px_rgba(34,211,238,0.12)]"
          : "border-border"
      }`}
      aria-labelledby="play-heading"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 id="play-heading" className="text-lg font-semibold text-fg">
          Zona de juego
        </h2>
        {canPlay && (
          <span className="inline-flex w-fit items-center rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            Es tu turno
          </span>
        )}
        {joined && ready && !canPlay && !game?.won && (
          <span className="inline-flex w-fit items-center rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            Turno de otro jugador
          </span>
        )}
      </div>

      {joined && !ready && (
        <div
          className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-fg"
          role="status"
        >
          <strong className="text-warning">Casi listo.</strong> Hace falta que se una{" "}
          <strong>al menos una persona más</strong>. Comparte el enlace o espera a otro jugador.
        </div>
      )}

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-surface-2/60 px-3 py-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">Turno actual</dt>
          <dd className="mt-1 font-medium text-fg">
            {ready ? (game?.currentTurnName ?? "—") : "—"}
          </dd>
        </div>
        <div className="rounded-xl bg-surface-2/60 px-3 py-2.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted">En la mesa</dt>
          <dd className="mt-1 font-medium text-fg">
            {Array.isArray(game?.players) ? game.players.join(", ") || "—" : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-2">
        <label htmlFor="guessN" className="block text-sm font-medium text-fg">
          Tu intento
        </label>
        <input
          id="guessN"
          className={inputClass}
          type="number"
          inputMode="numeric"
          min={minN}
          max={maxN}
          step={1}
          value={guessValue}
          onChange={(e) => onGuessChange(e.target.value)}
          disabled={inputDisabled}
          aria-describedby="guess-hint"
          aria-invalid={showOutOfRange || showNeedInteger}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onGuessSubmit();
            }
          }}
        />
        <p
          id="guess-hint"
          className={`text-sm ${showOutOfRange || showNeedInteger ? "text-warning" : "text-muted"}`}
        >
          {guessHint}
        </p>
      </div>

      <button
        type="button"
        className="mt-4 min-h-12 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-on-accent shadow-md transition-colors hover:bg-accent-hover focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[160px]"
        onClick={onGuessSubmit}
        disabled={!canSubmit}
      >
        Enviar intento
      </button>

      <fieldset className="mt-6 border-t border-border pt-5">
        <legend className="sr-only">Sonidos del juego</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 rounded border-border text-accent focus:ring-accent"
            checked={soundOn}
            onChange={(e) => {
              onSoundChange(e.target.checked);
              onUnlockAudio();
            }}
          />
          <span>
            <span className="font-medium text-fg">Sonidos suaves</span>
            <span className="mt-0.5 block text-muted">
              Un tono breve cuando es tu turno y una melodía corta si alguien acierta.
            </span>
          </span>
        </label>
      </fieldset>
    </section>
  );
}
