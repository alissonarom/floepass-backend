import { Request, Response } from "express";
import {
  createOrUpdateUser,
  getAllUsers,
  addPenaltyToUser,
  getUserById,
} from "../services/userService";
import User from "../models/User";
import List from "../models/List";
import QRCode from 'qrcode';
import mongoose from "mongoose";

const QRCodeSchema = new mongoose.Schema({
  cpf: { type: String, required: true, unique: true },
  qrCodeLink: { type: String, required: true },
});

const QRCodeModel = mongoose.model('QRCode', QRCodeSchema);

// Criar ou atualizar usuário
export const createOrUpdateUserHandler = async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    const { db, clientId} = req.auth;
    let userData = req.body;

    if (!userData.cpf) {
      return res.status(400).json({ message: "CPF é obrigatório" });
    }

    userData = {
      ...userData,
      client_id: clientId // Sobrescreve qualquer client_id enviado
    };

    // Converte tipos se necessário
    if (userData.cash !== undefined) {
      userData.cash = Number(userData.cash) || 0;
    }
    
    const user = await createOrUpdateUser(userData, db);

      const { password, ...safeUserData } = user;

    res.status(200).json(safeUserData);
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
    res.status(500).json({ 
      message: "Erro ao processar usuário",
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

export const getQRcodeUser = async (req: Request, res: Response) => {
  const { cpf } = req.params;
    try {
        const url = cpf;

        const qrCodeDataURL = await QRCode.toDataURL(url);

        await QRCodeModel.findOneAndUpdate(
          { cpf },
          { qrCodeLink: url },
          { upsert: true, new: true }
        );
        res.json({ qrCode: qrCodeDataURL, qrCodeLink: url });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar o QR code' });
    }
};

export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    const { clientId, db } = req.auth;
    const users = await getAllUsers(db, clientId);

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado pelo id" });
    }
    const { clientId, db } = req.user;

    const user = await getUserById(id, clientId, db);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado pelo id" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getUserByCpfHandler = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;

    if (!req.auth) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { clientId, db } = req.auth; // Assumindo que o middleware anexou o db correto

    console.log(`Buscando usuário com CPF: ${cpf} no banco do cliente: ${clientId}`);

    // 1. Busca o usuário base
    const user = await db.collection('users').findOne({ 
      cpf, 
      client_id: clientId 
    });

    if (!user) {
      console.log('Usuário não encontrado com os critérios:', { cpf, clientId });
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // // 2. Busca os históricos separadamente (já que não temos populate direto com o driver nativo)
    // const histories = await db.collection('histories').find({
    //   'users.id': user._id
    // }).project({
    //   name: 1,
    //   listDate: 1,
    //   isExam: 1,
    //   'users.$': 1
    // }).toArray();

    // // 3. Formata a resposta similar ao populate do Mongoose
    // const response = {
    //   ...user,
    //   histories: histories.map((history: IHistory) => ({
    //     ...history
    //   }) 
    // )
    // };

    // Remove a senha do objeto de resposta
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Adicionar penalidade a um usuário
export const addPenaltyToUserHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado pelo id" });
    }
    const { clientId, db } = req.user;
    const { cpf } = req.params;
    const penaltyData = req.body;
    const user = await addPenaltyToUser(cpf, penaltyData, clientId, db);

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const removeUserListHandler = async (req: Request, res: Response) => {
  try {
    const { listId, userId } = req.params;

    // Remove o usuário da lista
    const list = await List.findByIdAndUpdate(
      listId,
      { $pull: { users: userId } }, // Remove o userId do array de users
      { new: true }
    );

    if (!list) {
      return res.status(404).json({ message: "Lista não encontrada" });
    }

    res.status(200).json({ message: "Usuário removido da lista com sucesso" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}
