import express from "express";
import type { Express } from "express";

export function createExpressApp(staticRoot: string): Express {
  const app = express();
  /* Detrás de Railway / reverse proxy: X-Forwarded-* correctos para req.ip y futuros cookies seguros */
  app.set("trust proxy", 1);
  app.use(express.static(staticRoot));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}
