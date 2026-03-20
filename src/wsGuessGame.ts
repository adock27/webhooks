import type { RawData } from "ws";
import type { WebSocketServer } from "ws";
import { WebSocket } from "ws";

const RANGE = { min: 1, max: 100 } as const;

type Player = { ws: WebSocket; name: string };

type HistoryEntry = {
  name: string;
  n: number;
  result: "mayor" | "menor" | "igual";
  /** 0–100: qué tan cerca está el intento del número secreto (misma escala para todos en el rango). */
  proximityPct: number;
};

function randomInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function proximityPercent(guess: number, secret: number): number {
  const span = RANGE.max - RANGE.min;
  if (span <= 0) return 100;
  const d = Math.abs(guess - secret);
  const raw = 100 * (1 - d / span);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

type StandingRow = { rank: number; name: string; wins: number };

function buildStandings(
  winsByName: Map<string, number>,
  connectedNames: string[]
): StandingRow[] {
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
    out.push({ rank, name: rows[i].name, wins: rows[i].wins });
  }
  return out;
}

export function attachGuessGame(wss: WebSocketServer): void {
  const winsByName = new Map<string, number>();

  let secret = randomInt(RANGE.min, RANGE.max);
  let players: Player[] = [];
  /** Índice en `players` del jugador con turno */
  let currentPlayerIndex = 0;
  let history: HistoryEntry[] = [];
  let won = false;
  let winName: string | null = null;
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function newRound(message?: string) {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    secret = randomInt(RANGE.min, RANGE.max);
    history = [];
    currentPlayerIndex = 0;
    won = false;
    winName = null;
    broadcastState(message ? { message } : undefined);
  }

  function broadcastState(extra?: { message?: string }) {
    const cur = players[currentPlayerIndex];
    const standings = buildStandings(
      winsByName,
      players.map((p) => p.name)
    );
    const payload = JSON.stringify({
      type: "state",
      range: RANGE,
      players: players.map((p) => p.name),
      currentTurnName: cur?.name ?? null,
      history,
      won,
      winName,
      standings,
      ...extra,
    });
    for (const c of wss.clients) {
      if (c.readyState === WebSocket.OPEN) c.send(payload);
    }
  }

  function sendError(ws: WebSocket, msg: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "error", message: msg }));
    }
  }

  function handleDisconnect(ws: WebSocket) {
    const i = players.findIndex((p) => p.ws === ws);
    if (i === -1) return;
    const len = players.length;
    const cur = currentPlayerIndex;
    players.splice(i, 1);

    if (players.length === 0) {
      newRound("Nadie conectado. Nueva partida al unirse.");
      return;
    }

    if (i < cur) {
      currentPlayerIndex = cur - 1;
    } else if (i === cur) {
      if (i === len - 1) currentPlayerIndex = 0;
    }
    currentPlayerIndex =
      ((currentPlayerIndex % players.length) + players.length) % players.length;
    broadcastState();
  }

  wss.on("connection", (socket: WebSocket) => {
    socket.on("message", (buf: RawData) => {
      let data: unknown;
      try {
        data = JSON.parse(buf.toString());
      } catch {
        sendError(socket, "Mensaje inválido (usa JSON).");
        return;
      }

      if (!data || typeof data !== "object" || !("type" in data)) {
        sendError(socket, "Falta type.");
        return;
      }

      const t = (data as { type: string }).type;

      if (t === "join") {
        const name = String((data as { name?: unknown }).name ?? "").trim().slice(0, 40);
        if (!name) {
          sendError(socket, "El nombre no puede estar vacío.");
          return;
        }
        if (players.some((p) => p.ws === socket)) {
          sendError(socket, "Ya estás en la partida.");
          return;
        }
        players.push({ ws: socket, name });
        if (players.length === 1) {
          newRound();
        } else {
          broadcastState();
        }
        return;
      }

      const me = players.find((p) => p.ws === socket);
      if (!me) {
        sendError(socket, 'Primero envía { "type": "join", "name": "TuNombre" }.');
        return;
      }

      if (t === "guess") {
        if (won) {
          sendError(socket, "La ronda terminó; espera la siguiente.");
          return;
        }
        const curP = players[currentPlayerIndex];
        if (!curP || curP.ws !== socket) {
          sendError(socket, "No es tu turno.");
          return;
        }

        const n = Number((data as { n?: unknown }).n);
        if (!Number.isInteger(n) || n < RANGE.min || n > RANGE.max) {
          sendError(socket, `El número debe ser entero entre ${RANGE.min} y ${RANGE.max}.`);
          return;
        }

        let result: HistoryEntry["result"];
        if (n === secret) {
          result = "igual";
        } else if (n < secret) {
          result = "menor";
        } else {
          result = "mayor";
        }

        const proximityPct = proximityPercent(n, secret);
        history = [...history, { name: me.name, n, result, proximityPct }];
        won = result === "igual";
        if (won) {
          winName = me.name;
          winsByName.set(me.name, (winsByName.get(me.name) ?? 0) + 1);
          broadcastState({
            message: `${me.name} acertó: ${n}. Nueva ronda en unos segundos…`,
          });
          resetTimer = setTimeout(() => {
            resetTimer = null;
            newRound("Nueva partida. El turno empieza por el primer jugador en la lista.");
          }, 4500);
        } else {
          currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
          broadcastState();
        }
        return;
      }

      sendError(socket, `Tipo desconocido: ${t}`);
    });

    socket.on("close", () => handleDisconnect(socket));
  });
}
