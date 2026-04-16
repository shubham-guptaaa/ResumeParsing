import express from "express";
import cors from "cors";
import { DOMMatrix } from "@napi-rs/canvas";
import matchRoutes from "./routes/match.routes.js";

if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrix;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", matchRoutes);

app.get("/", (req, res) => {
  res.send("Resume Parsing Backend is Running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("[GlobalError]", err.message);
  res.status(500).json({ error: "An unexpected error occurred." });
});

export default app;