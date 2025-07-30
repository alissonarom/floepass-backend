import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
        user?: { userId?: ObjectId; clientId: string, db: Db }; // Adiciona a propriedade 'user'
    }
  }
}