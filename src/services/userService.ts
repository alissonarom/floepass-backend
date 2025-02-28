import User, { IUser } from "../models/User";

// Criar ou atualizar usuário
export const createOrUpdateUser = async (userData: Partial<IUser>) => {
  const { cpf } = userData;

  // Verifica se o usuário já existe
  const existingUser = await User.findOne({ cpf });

  if (existingUser) {
    // Atualiza o usuário existente
    const updatedUser = await User.findOneAndUpdate(
      { cpf },
      { $set: userData },
      { new: true }
    );
    return updatedUser;
  } else {
    // Cria um novo usuário
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  }
};

// Listar todos os usuários
export const getAllUsers = async () => {
  return await User.find({});
};

// Buscar usuário por CPF
export const getUserByCpf = async (cpf: string) => {
  return await User.findOne({ cpf });
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