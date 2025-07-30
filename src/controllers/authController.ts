import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { mongoClient, CUSTOMER_DBS } from '../app';
import bcrypt from 'bcrypt';

export const loginHandler = async (req: Request, res: Response) => {
  const { cpf, password } = req.body;

  if (!cpf || !password) {
    return res.status(400).json({ 
      code: 'MISSING_CREDENTIALS',
      message: 'CPF e senha são obrigatórios' 
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

    // Normaliza CPF (remove formatação)
    const cleanCpf = cpf.replace(/\D/g, '');

    for (const [customerName, dbName] of Object.entries(CUSTOMER_DBS)) {
      const db = mongoClient.db(dbName);
      const user = await db.collection('users').findOne({ 
        cpf: { $in: [cpf, cleanCpf] } // Busca em ambos formatos
      });

      if (user) {
        // Verifica se a senha está hasheada (começa com $2b$)
        const isPasswordHashed = user.password?.startsWith('$2b$');
        let passwordMatch = false;

        if (isPasswordHashed) {
          passwordMatch = await bcrypt.compare(password, user.password);
        } else {
          // Modo temporário para compatibilidade
          passwordMatch = user.password === password;
        }

        if (passwordMatch) {
          const token = jwt.sign(
            { 
              userId: user._id.toString(), 
              clientId: customerName 
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // 2 horas de expiração
          );

          // Se a senha não estava hasheada, hasheia agora
          if (!isPasswordHashed) {
            await db.collection('users').updateOne(
              { _id: user._id },
              { $set: { password: await bcrypt.hash(password, 10) } }
            );
          }

          return res.status(200).json({
            token,
            user: {
              id: user._id,
              name: user.name,
              cpf: user.cpf,
              profile: user.profile,
              client_id: customerName,
            },
            expiresIn: 7200 // 2 horas em segundos
          });
        }
      }
    }
    
    return res.status(401).json({ 
      code: 'INVALID_CREDENTIALS',
      message: 'CPF ou senha inválidos' 
    });
  } catch (error) {
    console.error("Erro no processo de login:", error);
    return res.status(500).json({ 
      code: 'LOGIN_ERROR',
      message: "Erro interno no servidor" 
    });
  }
};