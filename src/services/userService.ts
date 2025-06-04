import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { Db } from "mongodb";

// Criar ou atualizar usuário
export const createOrUpdateUser = async (
  userData: Partial<IUser> & { _id?: string | mongoose.Types.ObjectId },
  db: Db
): Promise<IUser> => {
  const { cpf, client_id, _id } = userData;

  // Normaliza o _id para ObjectId se existir
  const userId = _id ? new mongoose.Types.ObjectId(_id) : null;

  // Filtros de busca
  const filterById = userId ? { _id: userId } : null;
  const filterByCpf = { cpf, client_id };

  // Opções de atualização
  const updateOptions = {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  };

  // Dados para atualização
  const updateData = {
    $set: userData,
    $setOnInsert: {
      createdAt: new Date()
    }
  };

  try {
    // Tenta encontrar e atualizar o usuário
    const result = await db.collection('users').findOneAndUpdate(
      filterById || filterByCpf,
      updateData,
      updateOptions
    );

    if (!result || !result.value) {
      throw new Error('Falha ao criar/atualizar usuário');
    }

    return result.value as IUser;
  } catch (error) {
    console.error('Erro na operação de usuário:', error);
    throw error;
  }
};

// Listar todos os usuários
export const getAllUsers = async () => {
  return await User.find({});
};

// Buscar usuário por ID
export const getUserById = async (_id: string, clientId: string) => {
  return await User.findOne({ _id, client_id: clientId }); // Filtra por ID e client_id
};

// Adicionar penalidade a um usuário
export const addPenaltyToUser = async (cpf: string, penaltyData: any) => {
  const user = await User.findOne({ cpf });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  user.penalties.push(penaltyData);
  await user.save();
  return user;
};