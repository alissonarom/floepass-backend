import { Request, Response } from "express";
import {
  createOrUpdateUser,
  getAllUsers,
  getUserByCpf,
  addPenaltyToUser,
} from "../services/userService";

// Criar ou atualizar usuário
export const createOrUpdateUserHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await createOrUpdateUser(userData);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Listar todos os usuários
export const getAllUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Buscar usuário por CPF
export const getUserByCpfHandler = async (req: Request, res: Response) => {
  try {
    const { cpf } = req.params;
    const user = await getUserByCpf(cpf);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.status(200).json(user);
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