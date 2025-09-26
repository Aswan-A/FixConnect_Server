import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import indexRoutes from "./routes/index.routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/profile', express.static(path.join(process.cwd(), 'profile')));

connectDB();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});


app.use("/api/", indexRoutes);

app.use(errorHandler);

app.listen(PORT, () =>
  console.log(` Server running at http://localhost:${PORT}`)
);
