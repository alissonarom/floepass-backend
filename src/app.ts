import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import router from './routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://flowpass.netlify.app',
  credentials: true,
}));
app.use(express.json());

// Configurações do MongoDB
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const PORT = process.env.PORT ?? 5000;

// Configuração dos bancos de clientes
export const CUSTOMER_DBS: { [key: string]: string } = {
  greyMist: 'greyMistDb',
  amorChurch: 'test'
};

// Cria e exporta a instância do cliente MongoDB
export const mongoClient = new MongoClient(MONGO_URI, {
  maxPoolSize: 50,
  connectTimeoutMS: 10000,
});

// Conexão com o MongoDB
const startServer = async () => {
  try {
    await mongoClient.connect();
    console.log("✅ Conectado ao MongoDB");
    
    // Verifica conexão com cada banco de cliente
    for (const [customerName, dbName] of Object.entries(CUSTOMER_DBS)) {
      const db = mongoClient.db(dbName);
      await db.command({ ping: 1 });
      console.log(`✅ Banco ${dbName} disponível`);
    }
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
};

startServer();

// Rotas
app.use('/api', router);

export default app;