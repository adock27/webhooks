import type { HistoryEntry } from "@shared/protocol";

type Props = {
  rows: HistoryEntry[];
  lastRowNew: boolean;
  wonRound: boolean | undefined;
};

const cell = "border-b border-border px-3 py-2.5 text-left text-sm align-middle";
const thCell = `${cell} font-semibold text-muted`;

function hintClass(result: HistoryEntry["result"]) {
  if (result === "mayor") return "text-danger font-medium";
  if (result === "menor") return "text-accent font-medium";
  return "font-semibold text-success";
}

function formatProximityPct(p: number): string {
  return `${p.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function HistoryTable({ rows, lastRowNew, wonRound }: Props) {
  const empty = rows.length === 0;

  return (
    <section
      className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/20 sm:p-6"
      aria-labelledby="history-heading"
    >
      <h2 id="history-heading" className="text-lg font-semibold text-fg">
        Historial de intentos
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        La pista indica si el secreto es mayor o menor. El % muestra tu cercanía respecto al peor
        intento posible en el rango (100,00% = acierto, con dos decimales).{" "}
        <strong className="font-medium text-fg/80">Lo más reciente arriba.</strong>
      </p>

      {empty ? (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-8 text-center text-sm text-muted">
          Aún no hay intentos en esta ronda. Cuando alguien juegue, verás cada tirada aquí.
        </p>
      ) : (
        <div className="mt-4 -mx-1 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[340px] border-collapse text-fg">
            <caption className="sr-only">
              Historial de intentos del más reciente al más antiguo: nombre, número, pista y cercanía
            </caption>
            <thead>
              <tr className="bg-surface-2/80">
                <th scope="col" className={thCell}>
                  Quién
                </th>
                <th scope="col" className={thCell}>
                  Número
                </th>
                <th scope="col" className={thCell}>
                  Pista
                </th>
                <th scope="col" className={`${thCell} min-w-[100px]`}>
                  Cercanía
                </th>
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map((row, displayIdx) => {
                const hint =
                  row.result === "mayor"
                    ? "Más abajo"
                    : row.result === "menor"
                      ? "Más arriba"
                      : "¡Acertó!";
                const p = typeof row.proximityPct === "number" ? row.proximityPct : null;
                const origIdx = rows.length - 1 - displayIdx;
                const isNewest = displayIdx === 0;
                return (
                  <tr
                    key={`${row.name}-${row.n}-${origIdx}-${String(wonRound)}`}
                    className={`hover:bg-surface-2/40 ${isNewest && lastRowNew ? "animate-row-in" : ""}`}
                  >
                    <td className={`${cell} font-medium`}>{row.name}</td>
                    <td className={cell}>{row.n}</td>
                    <td className={`${cell} ${hintClass(row.result)}`}>
                      <span className="mr-1" aria-hidden>
                        {row.result === "mayor" ? "↓" : row.result === "menor" ? "↑" : "◎"}
                      </span>
                      {hint}
                    </td>
                    <td className={`${cell} min-w-[100px]`}>
                      {p !== null && (
                        <div
                          className="mb-1 h-2 max-w-[140px] overflow-hidden rounded-full bg-border"
                          aria-hidden
                        >
                          <div
                            className={`h-full rounded-full transition-[width] duration-[450ms] ease-out ${
                              p < 40
                                ? "bg-gradient-to-r from-danger to-warning"
                                : "bg-gradient-to-r from-accent to-success"
                            }`}
                            style={{ width: `${p}%` }}
                          />
                        </div>
                      )}
                      <span className="tabular-nums text-muted">
                        {p !== null ? formatProximityPct(p) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
