import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import router from "./routes";
import photoRoutes from "./routes/photoRoutes";
import { ensureDbConnection } from "./utils/prisma";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT ?? 5000;

// Start server with PostgreSQL readiness check
const startServer = async () => {
  try {
    await ensureDbConnection();
    console.log("✅ Conectado ao PostgreSQL via Prisma");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err);
    process.exit(1);
  }
};

startServer();

// Rotas
app.use("/api", router);
app.use("/api/photos", photoRoutes);

export default app;
