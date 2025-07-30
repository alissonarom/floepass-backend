import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { mongoClient, CUSTOMER_DBS } from '../app';
import { ObjectId } from 'mongodb';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: ObjectId;
      clientId: string;
      db: ReturnType<typeof mongoClient.db>;
    };
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader?.toString().split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      code: 'MISSING_TOKEN',
      message: "Token de autenticação não fornecido" 
    });
  }

  try {
    // Verifica se o JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { 
      userId: string; 
      clientId: string;
      exp: number;
    };

    // Verifica se o token expirou
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: "Token expirado - faça login novamente"
      });
    }

    if (!CUSTOMER_DBS[decoded.clientId]) {
      return res.status(403).json({ 
        code: 'INVALID_TENANT',
        message: "Organização do usuário não existe" 
      });
    }

    req.auth = {
      userId: new ObjectId(decoded.userId),
      clientId: decoded.clientId,
      db: mongoClient.db(CUSTOMER_DBS[decoded.clientId])
    };

    console.log(`Autenticação bem-sucedida para usuário ${decoded.userId} no tenant ${decoded.clientId}`);
    next();
  } catch (err) {
    console.error('Erro na autenticação:', err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        code: 'TOKEN_EXPIRED',
        message: "Sessão expirada - faça login novamente" 
      });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        code: 'INVALID_TOKEN',
        message: "Token inválido" 
      });
    }

    return res.status(500).json({ 
      code: 'AUTH_ERROR',
      message: "Erro durante a autenticação" 
    });
  }
};