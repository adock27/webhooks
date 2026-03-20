import express from "express";
import type { Express } from "express";

export function createExpressApp(staticRoot: string): Express {
  const app = express();
  app.use(express.static(staticRoot));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}
