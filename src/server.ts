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
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 5000;

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
  const certDir = path.resolve(__dirname, "../../certs"); 
  const certPath = path.join(certDir, "dev-local.pem");
  const keyPath = path.join(certDir, "dev-local-key.pem");

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error("Certificates not found!");
  }

  const cert = fs.readFileSync(certPath); 
  const key = fs.readFileSync(keyPath);   

  https.createServer({ key, cert }, app).listen(PORT, "0.0.0.0", () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`);
  });
} catch (error) {
  console.warn("HTTPS certificates not found, falling back to HTTP.", error);
  http.createServer(app).listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP Server running at http://localhost:${PORT}`);
  });
}
