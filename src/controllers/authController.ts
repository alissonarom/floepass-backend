import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Importe o modelo de usuário

export const loginHandler = async (req: Request, res: Response) => {
  const { cpf, password } = req.body;

  try {
    // Verifica se o usuário existe no banco de dados
    const user = await User.findOne({ cpf });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verifica se a senha está correta (substitua por uma lógica de hash, se necessário)
    if (user.password !== password) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // Gera um token JWT
    const token = jwt.sign(
      { userId: user._id, clientId: user.client_id }, // Dados incluídos no token
      'secreto', // Chave secreta (use uma chave forte em produção)
      { expiresIn: '1h' } // Tempo de expiração do token
    );

    // Retorna o token para o frontend
    res.status(200).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          cpf: user.cpf,
          profile: user.profile,
          client_id: user.client_id,
        },
      });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};