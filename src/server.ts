import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { attachGuessGame } from "./wsGuessGame.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const envPort = process.env.PORT;
const basePort = Number(envPort) || 3000;
/** En Railway/Heroku etc. PORT es fijo: no intentar otros puertos. */
const portLocked = Boolean(envPort);
const host = process.env.HOST ?? "0.0.0.0";
const app = express();
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

function listenFrom(port: number, attemptsLeft: number): void {
  if (attemptsLeft <= 0) {
    console.error(
      "No hay puerto libre en el rango probado. Cierra el proceso que usa el puerto o define PORT."
    );
    process.exit(1);
  }

  const server = http.createServer(app);
  const wssGame = new WebSocketServer({ server, path: "/ws/game" });
  attachGuessGame(wssGame);

  server.listen(port, host, () => {
    if (!portLocked && port !== basePort) {
      console.warn(`Puerto ${basePort} ocupado; usando ${port}.`);
    }
    console.log(`Escuchando en http://${host}:${port}/`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && !portLocked) {
      console.warn(`Puerto ${port} en uso → probando ${port + 1}…`);
      server.close(() => {});
      listenFrom(port + 1, attemptsLeft - 1);
      return;
    }
    console.error(err);
    process.exit(1);
  });
}

listenFrom(basePort, portLocked ? 1 : 20);
