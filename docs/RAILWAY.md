# Despliegue en Railway

## Qué hace el proyecto en producción

1. **`npm run build`**: compila la API (`tsc` → `dist/`) y el front (`vite build` → `client/dist/`).
2. **`npm start`**: ejecuta `node dist/server.js`, que sirve `client/dist` si existe `index.html`; si no, cae en `public/`.
3. **Puerto**: Railway define `PORT`; el servidor lo respeta y escucha en **`0.0.0.0`** (obligatorio en contenedores).
4. **Salud**: `GET /health` devuelve `{ "ok": true }` — usado como **healthcheck** en `railway.json`.

## WebSocket

El cliente usa `wss://` cuando la página es `https://` y el mismo host que la web (`client/src/lib/wsUrl.ts`). No hace falta variable extra si la app y el WS van en el **mismo servicio** y dominio.

## Config en el repo

| Archivo        | Rol |
|----------------|-----|
| `railway.json` | `buildCommand`: build completo; `healthcheckPath`: `/health`; `startCommand`: `npm start`. |
| `nixpacks.toml` | `NPM_CONFIG_PRODUCTION=false` para que `npm ci` no omita opcionales de `@tailwindcss/oxide` en Linux. |

Vite, Tailwind, TypeScript y `@types/*` están en **`dependencies`** para que el build siga funcionando aunque el entorno use flags tipo production.

El aviso `npm warn config production Use --omit=dev instead` en los logs suele ser **cosmético** (npm depreca el flag interno); no impide el build si la instalación es correcta.

## Checklist en el dashboard

- **Root directory**: raíz del repo (donde está `package.json`).
- **Variables**: no son obligatorias; Railway inyecta `PORT`.
- Tras el primer deploy, abre la URL pública: debe cargar el React y conectar el WS a `/ws/game`.

## Si el front no aparece

Comprueba en los logs del build que exista `client/dist/index.html`. Sin build de Vite, el servidor solo sirve `public/index.html` (mensaje de “construye el front”).
