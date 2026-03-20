import type { StandingRow } from "../shared/protocol.js";

export function buildStandings(
  winsByName: Map<string, number>,
  connectedNames: string[]
): StandingRow[] {
  const online = new Set(connectedNames);
  const names = new Set<string>([...winsByName.keys(), ...connectedNames]);
  const rows = [...names].map((name) => ({
    name,
    wins: winsByName.get(name) ?? 0,
  }));
  rows.sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name, "es"));

  const out: StandingRow[] = [];
  let rank = 1;
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && rows[i].wins !== rows[i - 1].wins) {
      rank = i + 1;
    }
    const name = rows[i].name;
    out.push({
      rank,
      name,
      wins: rows[i].wins,
      online: online.has(name),
    });
  }
  return out;
}
