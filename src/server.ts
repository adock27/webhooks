import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { attachGuessGame } from "./wsGuessGame.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const basePort = Number(process.env.PORT) || 3000;
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

  server.listen(port, () => {
    if (port !== basePort) {
      console.warn(`Puerto ${basePort} ocupado; usando ${port}.`);
    }
    console.log(`Juego: http://127.0.0.1:${port}/`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Puerto ${port} en uso → probando ${port + 1}…`);
      server.close(() => {});
      listenFrom(port + 1, attemptsLeft - 1);
      return;
    }
    console.error(err);
    process.exit(1);
  });
}

listenFrom(basePort, 20);
