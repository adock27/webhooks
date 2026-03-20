type Props = {
  nick: string;
  onNickChange: (v: string) => void;
  onJoin: () => void;
  wsOpen: boolean;
};

const inputClass =
  "box-border min-h-11 w-full max-w-full rounded-xl border border-border bg-app px-4 py-2.5 text-base text-fg placeholder:text-muted/60 transition-colors hover:border-muted/50 sm:max-w-md";

export function JoinPanel({ nick, onNickChange, onJoin, wsOpen }: Props) {
  const canJoin = Boolean(nick.trim()) && wsOpen;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/20 sm:p-6"
      aria-labelledby="join-heading"
    >
      <h2 id="join-heading" className="text-lg font-semibold text-fg">
        Entrar a la partida
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Elige un nombre que verán los demás. Necesitas al menos dos personas conectadas para
        empezar a jugar por turnos.
      </p>
      <div className="mt-5 space-y-2">
        <label htmlFor="nick" className="block text-sm font-medium text-fg">
          Tu nombre o apodo
        </label>
        <input
          id="nick"
          className={inputClass}
          maxLength={40}
          autoComplete="nickname"
          placeholder="Por ejemplo, Ana"
          value={nick}
          onChange={(e) => onNickChange(e.target.value)}
          aria-describedby="nick-hint"
          disabled={!wsOpen}
        />
        <p id="nick-hint" className="text-xs text-muted">
          Máximo 40 caracteres. Puedes cambiarlo cerrando la pestaña y volviendo a entrar.
        </p>
      </div>
      <button
        type="button"
        className="mt-5 min-h-12 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-on-accent shadow-md transition-colors hover:bg-accent-hover focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-[200px]"
        onClick={onJoin}
        disabled={!canJoin}
      >
        Unirme a la partida
      </button>
      {!wsOpen && (
        <p className="mt-3 text-sm text-warning" role="alert">
          Espera a que aparezca la conexión lista arriba antes de unirte.
        </p>
      )}
    </section>
  );
}
