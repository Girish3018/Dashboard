import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import findingsRoutes from "./routes/findings.js";
import authRoutes from "./routes/auth.js";
import scanRoutes from "./routes/scan.js";
import repositoriesRoutes from "./routes/repositories.js";
import { verifyToken } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/findings", findingsRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/repositories", repositoriesRoutes);

app.get("/", (req, res) => {
  res.send("SOC Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
