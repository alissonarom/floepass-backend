import User, { IUser } from "../models/User";

// Criar ou atualizar usuário
export const createOrUpdateUser = async (userData: Partial<IUser>) => {
  const { cpf, client_id } = userData;

  // Verifica se o usuário já existe
  const existingUser = await User.findOne({ cpf, client_id });

  if (existingUser) {
    // Atualiza o usuário existente
    const updatedUser = await User.findOneAndUpdate(
      { cpf, client_id },
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