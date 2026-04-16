import express from "express";
import cors from "cors";
import matchRoutes from "./routes/match.routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", matchRoutes);

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

export { app };