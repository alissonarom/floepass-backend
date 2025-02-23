import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from './routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use(routes);

// Conexão com o MongoDB
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/flowapp";
const PORT = process.env.PORT ?? 5000;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1); // Encerra a aplicação em caso de falha na conexão
  }
};

startServer();
