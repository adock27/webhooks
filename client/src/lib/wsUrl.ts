/** URL del WebSocket del juego según entorno (proxy Vite en dev, mismo host en prod). */
export function resolveWsHost(): string {
  const params = new URLSearchParams(location.search);
  const hostFromQuery = params.get("host");
  if (hostFromQuery) {
    localStorage.setItem("devWsHost", hostFromQuery);
    return hostFromQuery;
  }
  const saved = localStorage.getItem("devWsHost");
  if (saved) return saved;
  if (location.host) {
    if (location.port === "5500")
      return `${location.hostname || "127.0.0.1"}:3000`;
    return location.host;
  }
  return "127.0.0.1:3000";
}

export function buildGameWsUrl(): string {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${resolveWsHost()}/ws/game`;
}
