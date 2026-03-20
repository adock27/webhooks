/**
 * Contrato WebSocket cliente ↔ servidor.
 * Sin dependencias de Node/React: importable en front y back.
 */
export type GameRange = { min: number; max: number };

export type GuessResult = "mayor" | "menor" | "igual";

export type HistoryEntry = {
  name: string;
  n: number;
  result: GuessResult;
  proximityPct: number;
};

export type StandingRow = {
  rank: number;
  name: string;
  wins: number;
  online: boolean;
};

/** Payload enviado con `type: "state"` */
export type GameStatePayload = {
  type: "state";
  range: GameRange;
  players: string[];
  readyToPlay: boolean;
  currentTurnName: string | null;
  history: HistoryEntry[];
  won: boolean;
  winName: string | null;
  standings: StandingRow[];
  message?: string;
};

export type ErrorPayload = {
  type: "error";
  message: string;
};

export type ClientJoinMessage = { type: "join"; name: string };
export type ClientGuessMessage = { type: "guess"; n: number };
