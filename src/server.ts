import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import indexRoutes from "./routes/index.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from "path";
import fs from "fs";
import https from "https";
import http from "http";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/", indexRoutes);
app.use(errorHandler);

try {
  const key = fs.readFileSync(path.join(process.cwd(), "certs/localhost-key.pem"));
  const cert = fs.readFileSync(path.join(process.cwd(), "certs/localhost.pem"));
  const httpsOptions = { key, cert };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`);
  });
} catch (error) {
  console.warn("HTTPS certificates not found, falling back to HTTP.");
  http.createServer(app).listen(PORT, () => {
    console.log(`HTTP Server running at http://localhost:${PORT}`);
  });
}
