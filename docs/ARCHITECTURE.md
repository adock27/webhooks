# Arquitectura del proyecto

## Vista general

Monorepo ligero: **API Node** (`src/`) + **cliente React** (`client/`) + **contrato compartido** (`src/shared/`).

```
src/
  server.ts              # Entrada HTTP + WebSocket
  http/createApp.ts      # Express (estáticos + /health)
  ws/guessGameAttachment.ts  # Cableado WS → lógica de partida
  game/                  # Lógica pura (sin WebSocket): rango, standings, proximidad
  shared/protocol.ts     # Tipos del protocolo cliente-servidor
client/
  src/
    features/game/       # UI del juego (hook + componentes)
    lib/                 # Utilidades de front (p. ej. URL del WS)
```

## Capas

| Capa | Responsabilidad |
|------|-----------------|
| **protocol** | Tipos JSON comunes; no importar Node ni React. |
| **game/** | Reglas, sorteos de rango, standings, % cercanía (testeable sin red). |
| **ws/** | Mensajes entrantes, validación, broadcast; usa `game/*`. |
| **http/** | Montaje de Express. |
| **client/features** | Pantallas; hooks para estado + WebSocket; componentes presentacionales. |

**Estilos:** Tailwind CSS v4 (`@tailwindcss/vite`), entrada en `client/src/App.css` (`@import "tailwindcss"`).

## Flujo de datos

1. Cliente abre WebSocket a `/ws/game`.
2. Servidor (`guessGameAttachment`) parsea JSON, muta estado en memoria, emite `state` o `error`.
3. React actualiza vía `useGuessGame` (un solo hook por pantalla de juego).

## Escalado futuro

- Extraer `GuessGameSession` (clase) en `src/game/` si el estado crece.
- Persistencia: sustituir `Map` de victorias por repositorio (archivo/DB) detrás de una interfaz.
- Otros juegos: nuevo `ws/fooAttachment.ts` + ruta `/ws/foo`.
