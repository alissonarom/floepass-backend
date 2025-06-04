import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { mongoClient, CUSTOMER_DBS } from '../app';

export const loginHandler = async (req: Request, res: Response) => {
  const { cpf, password } = req.body;

  if (!cpf || !password) {
    return res.status(400).json({ error: 'CPF e senha são obrigatórios' });
  }

  try {
    for (const [customerName, dbName] of Object.entries(CUSTOMER_DBS)) {
      const db = mongoClient.db(dbName);
      const user = await db.collection('users').findOne({ cpf });
      
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          const token = jwt.sign(
            { userId: user._id.toString(), clientId: customerName },
            'secreto', // Use process.env.JWT_SECRET em produção
            { expiresIn: '1h' }
          );

          return res.status(200).json({
            token,
            user: {
              id: user._id,
              name: user.name,
              cpf: user.cpf,
              profile: user.profile,
              client_id: customerName,
            }
          });
        }
      }
    }
    
    return res.status(401).json({ error: 'CPF ou senha inválidos' });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};