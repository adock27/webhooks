import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { WebSocketServer } from "ws";
import { createExpressApp } from "./http/createApp.js";
import { attachGuessGame } from "./ws/guessGameAttachment.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const clientDist = path.join(__dirname, "..", "client", "dist");
const staticRoot = fs.existsSync(path.join(clientDist, "index.html"))
  ? clientDist
  : publicDir;

const envPort = process.env.PORT;
const basePort = Number(envPort) || 3000;
/** En Railway/Heroku etc. PORT es fijo: no intentar otros puertos. */
const portLocked = Boolean(envPort);
const host = process.env.HOST ?? "0.0.0.0";

const app = createExpressApp(staticRoot);

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
