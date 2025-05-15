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
    const userData = req.body;

    // Verifica se o client_id foi fornecido
    if (!userData.client_id) {
      return res.status(400).json({ message: "client_id é obrigatório" });
    }

    // Garanta que `cash` seja um número
    if (userData.cash !== undefined && userData.cash !== null) {
      userData.cash = parseFloat(userData.cash);
      if (isNaN(userData.cash)) {
        userData.cash = 0; // Valor padrão
      }
    }

    const user = await createOrUpdateUser(userData);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado ou não pôde ser criado" });
    }

    // Converte o documento Mongoose para um objeto JavaScript
    const userResponse = user.toObject();

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
    res.status(400).json({ message: (error as Error).message });
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
    const users = await getAllUsers();

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
    const { clientId } = req.user;

    const user = await getUserById(id, clientId);

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

    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    const { clientId } = req.user;

    const user = await User.findOne({ cpf, client_id: clientId })
      .populate({
        path: 'histories',
        select: 'name listDate isExam', // Campos do histórico que você quer trazer
        populate: {
          path: 'users.id',
          select: 'name profile -_id' // Campos dos usuários que você quer trazer
        }
      })
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Remove a senha do objeto de resposta
    const { password, ...userWithoutPassword } = user as { password?: string; [key: string]: any };

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Adicionar penalidade a um usuário
export const addPenaltyToUserHandler = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const penaltyData = req.body;
    const user = await addPenaltyToUser(cpf, penaltyData);

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
