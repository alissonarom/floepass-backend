import mongoose from "mongoose";
import { IUser } from "../models/User";
import { Db, ReturnDocument } from "mongodb";

// Criar ou atualizar usuário
export const createOrUpdateUser = async (
  userData: Partial<IUser>,
  db: Db,
): Promise<IUser> => {
  const { cpf, _id, client_id, penalties, ...restUserData } = userData;

  // Validação crítica
  if (!client_id) {
    throw new Error("client_id é obrigatório");
  }

  const userId = (_id && typeof _id === 'string')
    ? new mongoose.Types.ObjectId(_id)
    : _id;

  const filter = userId 
    ? { _id: userId, client_id }
    : { cpf, client_id };

  const updateOptions = {
    returnDocument: ReturnDocument.AFTER,
    upsert: true,
    includeResultMetadata: true
  };

  const updateOperation: any = {
    $set: {
      ...restUserData,
      updatedAt: new Date()
    },
    $setOnInsert: {
      createdAt: new Date(),
      penalties: penalties || []
    }
  };

  if (penalties && penalties.length > 0) {
    updateOperation.$addToSet = {
      penalties: { $each: penalties }
    };
  }

  try {
    const result = await db.collection('users').findOneAndUpdate(
      filter,
      updateOperation,
      updateOptions
    );

    if (result?.ok !== 1) {
      throw new Error('Operação não foi confirmada pelo MongoDB');
    }

    if (!result.value && result.lastErrorObject?.upserted) {
      const insertedUser = await db.collection('users').findOne({ 
        _id: result.lastErrorObject.upserted 
      });
      if (insertedUser) return insertedUser as IUser;
    }

    if (result.value) {
      return result.value as IUser;
    }

    throw new Error('Nenhum documento foi criado ou atualizado');
  } catch (error) {
    console.error('Erro detalhado:', {
      error: error instanceof Error ? error.message : error,
      operation: 'createOrUpdateUser',
      client_id,
      cpf: cpf ? '***' + cpf.slice(-3) : 'undefined'
    });
    throw new Error(`Falha ao processar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Listar todos os usuários do tenant específico
export const getAllUsers = async (db: Db, clientId: string) => {
  return db.collection('users')
    .find({ client_id: clientId })
    .project({ password: 0 }) // Remove o campo de senha dos resultados
    .toArray();
};

// Buscar usuário por ID (com verificação de tenant)
export const getUserById = async (
  userId: string, 
  clientId: string, 
  db: Db
): Promise<IUser | null> => {
  try {
    const user = await db.collection('users').findOne(
      { 
        _id: new mongoose.Types.ObjectId(userId),
        client_id: clientId 
      },
      { projection: { password: 0 } } // Exclui o campo password
    );
    return user as IUser | null;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
};

// Adicionar penalidade a um usuário (com verificação de tenant)
export const addPenaltyToUser = async (
  cpf: string, 
  penaltyData: any, 
  clientId: string,
  db: Db
): Promise<IUser> => {
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { 
        cpf,
        client_id: clientId 
      },
      { 
        $push: { penalties: penaltyData },
        $set: { updatedAt: new Date() }
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 } 
      }
    );

    if (!result || !result.value) {
      throw new Error("Usuário não encontrado");
    }

    return result.value as IUser;
  } catch (error) {
    console.error('Erro ao adicionar penalidade:', error);
    throw error;
  }
};

// Função adicional: Buscar usuário por CPF (com verificação de tenant)
export const getUserByCpf = async (
  cpf: string,
  clientId: string,
  db: Db
): Promise<IUser | null> => {
  try {
    const user = await db.collection('users').findOne(
      { 
        cpf,
        client_id: clientId 
      },
      { projection: { password: 0 } }
    );
    return user as IUser | null;
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    throw error;
  }
};

// Função adicional: Atualizar parcialmente um usuário
export const updateUserPartial = async (
  userId: string,
  clientId: string,
  updateData: Partial<IUser>,
  db: Db
): Promise<IUser> => {
  try {
    const result = await db.collection('users').findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(userId),
        client_id: clientId 
      },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date() 
        } 
      },
      { 
        returnDocument: 'after',
        projection: { password: 0 } 
      }
    );

    if (!result || !result.value) {
      throw new Error("Usuário não encontrado");
    }

    return result.value as IUser;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};