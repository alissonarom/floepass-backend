import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from './routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://flowpass.netlify.app', // Substitua pela URL do seu frontend
  credentials: true, // Permite o envio de cookies e autenticação
}));
app.use(express.json());

// Rotas
app.use('/api', router); // Corrigido o caminho da rota

// Conexão com o MongoDB
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/flowapp";
const PORT = process.env.PORT ?? 5000;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");    
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1); // Encerra a aplicação em caso de falha na conexão
  }
};

// Chama a função de conexão
startServer();

export default app; // Exporte o app para Vercel