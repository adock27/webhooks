import { useCallback, useEffect, useRef, useState } from "react";
import { buildGameWsUrl } from "../../../lib/wsUrl";
import type { GameStatePayload, HistoryEntry } from "@shared/protocol";

export function useGuessGame() {
  const [nick, setNick] = useState(() => localStorage.getItem("guessNick") ?? "");
  const [joined, setJoined] = useState(false);
  const [myName, setMyName] = useState("");
  const [game, setGame] = useState<GameStatePayload | null>(null);
  const [connStatus, setConnStatus] = useState("Conectando con el servidor…");
  const [wsOpen, setWsOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [soundOn, setSoundOn] = useState(
    () => localStorage.getItem("guessSoundOn") === "1"
  );
  const [guessValue, setGuessValue] = useState("");
  const [winFlash, setWinFlash] = useState(false);
  const [lastRowNew, setLastRowNew] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevHistLenRef = useRef(0);
  const prevTurnName = useRef<string | null | undefined>(undefined);

  const unlockAudio = useCallback(() => {
    try {
      audioCtxRef.current = audioCtxRef.current ?? new AudioContext();
      if (audioCtxRef.current.state === "suspended")
        void audioCtxRef.current.resume();
    } catch {
      /* */
    }
  }, []);

  const beep = useCallback(
    (freq: number, ms: number, vol = 0.06) => {
      if (!soundOn || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => o.stop(), ms);
    },
    [soundOn]
  );

  useEffect(() => {
    localStorage.setItem("guessSoundOn", soundOn ? "1" : "0");
  }, [soundOn]);

  useEffect(() => {
    const url = buildGameWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsOpen(true);
      setConnStatus("Listo. Escribe tu nombre y pulsa «Unirme a la partida».");
    };
    ws.onclose = (ev) => {
      setWsOpen(false);
      setConnStatus(
        ev.wasClean || ev.code === 1000
          ? "Sesión cerrada. Recarga la página para volver a intentarlo."
          : `Sin conexión (código ${ev.code}). Comprueba que el servidor esté en marcha.`
      );
    };
    ws.onerror = () => {
      setWsOpen(false);
      setConnStatus("No se pudo conectar. Revisa la red o que el juego esté desplegado.");
    };
    ws.onmessage = (ev) => {
      let data: unknown;
      try {
        data = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        (data as { type: string }).type === "error"
      ) {
        setErrorBanner(String((data as { message?: string }).message ?? "Error"));
        return;
      }
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        (data as { type: string }).type === "state"
      ) {
        setErrorBanner("");
        setGame(data as GameStatePayload);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  const hist = game?.history ?? [];
  const ready = Boolean(game?.readyToPlay);
  const canPlay =
    joined &&
    ready &&
    !game?.won &&
    Boolean(myName) &&
    game?.currentTurnName === myName;

  useEffect(() => {
    const turnNow = ready ? game?.currentTurnName : null;
    if (canPlay && turnNow === myName && prevTurnName.current !== turnNow) {
      beep(880, 90);
      if (navigator.vibrate) navigator.vibrate(30);
    }
    prevTurnName.current = turnNow;
  }, [canPlay, game?.currentTurnName, myName, ready, beep]);

  useEffect(() => {
    const len = hist.length;
    if (len > prevHistLenRef.current && len > 0) {
      const last = hist[len - 1] as HistoryEntry;
      setLastRowNew(true);
      const t = setTimeout(() => setLastRowNew(false), 400);
      if (last?.result === "igual") {
        setWinFlash(true);
        setTimeout(() => setWinFlash(false), 600);
        beep(523, 120, 0.08);
        setTimeout(() => beep(659, 140, 0.08), 130);
        if (navigator.vibrate) navigator.vibrate([40, 50, 60]);
      }
      prevHistLenRef.current = len;
      return () => clearTimeout(t);
    }
    prevHistLenRef.current = len;
  }, [hist, beep]);

  const join = useCallback(() => {
    unlockAudio();
    const name = nick.trim().slice(0, 40);
    const ws = wsRef.current;
    if (!name || !ws || ws.readyState !== WebSocket.OPEN) return;
    setMyName(name);
    localStorage.setItem("guessNick", name);
    ws.send(JSON.stringify({ type: "join", name }));
    setJoined(true);
    setConnStatus("Estás en la partida.");
  }, [nick, unlockAudio]);

  const sendGuess = useCallback(() => {
    const ws = wsRef.current;
    const n = Number(guessValue);
    if (!Number.isInteger(n) || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "guess", n }));
  }, [guessValue]);

  const r = game?.range;
  const rangeSummary =
    r && typeof r.min === "number" && typeof r.max === "number"
      ? `En esta ronda el número está entre ${r.min} y ${r.max}.`
      : "Cada ronda usa un rango al azar. Únete para ver los límites en esta partida.";
  const rangeDetail =
    r && typeof r.min === "number" && typeof r.max === "number"
      ? `Puedes escribir cualquier entero en ese intervalo (${r.max - r.min + 1} opciones).`
      : "Se elige un intervalo amplio (mínimo 100 números) para que la partida sea justa.";

  let bannerText = "";
  let bannerShow = false;
  if (errorBanner) {
    bannerText = errorBanner;
    bannerShow = true;
  } else if (game?.message) {
    bannerText = game.message;
    bannerShow = true;
  } else if (game?.won && game.winName) {
    bannerText = `¡Ronda para ${game.winName}! Preparando la siguiente…`;
    bannerShow = true;
  }

  const minN = r?.min ?? 1;
  const maxN = r?.max ?? 100_000;
  const guessNum = Number(guessValue);
  const guessValid = Number.isInteger(guessNum);
  const guessInRange =
    guessValid && guessNum >= minN && guessNum <= maxN;

  return {
    nick,
    setNick,
    joined,
    game,
    connStatus,
    wsOpen,
    soundOn,
    setSoundOn,
    guessValue,
    setGuessValue,
    winFlash,
    lastRowNew,
    rangeSummary,
    rangeDetail,
    bannerText,
    bannerShow,
    serverError: errorBanner,
    standings: game?.standings ?? [],
    hist,
    ready,
    canPlay,
    minN,
    maxN,
    guessValid,
    guessInRange,
    join,
    sendGuess,
    unlockAudio,
  };
}
