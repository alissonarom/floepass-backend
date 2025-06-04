import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { mongoClient, CUSTOMER_DBS } from '../app';
import { ObjectId } from 'mongodb';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token de autenticação não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, "secreto") as { userId: ObjectId; clientId: string };
    
    // Verifica se o cliente existe na configuração
    if (!CUSTOMER_DBS[decoded.clientId]) {
      return res.status(403).json({ message: "Organização do usuário não existe" });
    }

    // Conecta ao banco correto e verifica se usuário ainda existe
    const db = mongoClient.db(CUSTOMER_DBS[decoded.clientId]);
    const user = await db.collection('users').findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(403).json({ message: "Usuário não encontrado" });
    }

    // Anexa informações ao request
    req.user = {
      userId: user._id,
      clientId: decoded.clientId,
      db: db // Inclui a referência ao banco correto
    };

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido ou expirado" });
  }
};