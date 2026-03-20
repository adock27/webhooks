import type { StandingRow } from "@shared/protocol";

type Props = { rows: StandingRow[] };

const cell = "border-b border-border px-3 py-2.5 text-left text-sm";
const thCell = `${cell} font-semibold text-muted`;

export function StandingsTable({ rows }: Props) {
  const empty = rows.length === 0;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/20 sm:p-6"
      aria-labelledby="standings-heading"
    >
      <h2 id="standings-heading" className="text-lg font-semibold text-fg">
        Tabla de posiciones
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Victorias en esta sesión. «En línea» indica si el jugador tiene la página abierta ahora.
      </p>

      {empty ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-8 text-center text-sm text-muted">
          Cuando haya resultados, aquí verás el ranking de la sesión.
        </p>
      ) : (
        <div className="mt-4 -mx-1 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[320px] border-collapse text-fg">
            <caption className="sr-only">
              Posiciones por victorias y estado de conexión
            </caption>
            <thead>
              <tr className="bg-surface-2/80">
                <th scope="col" className={thCell}>
                  #
                </th>
                <th scope="col" className={thCell}>
                  Jugador
                </th>
                <th scope="col" className={thCell}>
                  Victorias
                </th>
                <th scope="col" className={thCell}>
                  En línea
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.rank}-${row.name}-${row.wins}`}
                  className="hover:bg-surface-2/40"
                >
                  <td className={cell}>{row.rank}</td>
                  <td className={`${cell} font-medium`}>{row.name}</td>
                  <td className={cell}>{row.wins}</td>
                  <td className={cell}>
                    {row.online ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-success" aria-hidden />
                        <span className="text-fg">Sí</span>
                        <span className="sr-only">Conectado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <span className="size-2 rounded-full bg-muted/50" aria-hidden />
                        No
                        <span className="sr-only">Desconectado</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
