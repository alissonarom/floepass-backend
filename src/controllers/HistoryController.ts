// src/backend/controllers/HistoryController.ts
import { Request, Response } from "express";
import History from "../models/History";
import mongoose from "mongoose";

export default {
  // Listar todos os históricos
  async index(req: Request, res: Response) {
    try {
      const histories = await History.find()
        .populate({
          path: "users.id",
          model: 'User'
        })
        .lean(); // Popula o aprovador do ticket
      
      return res.json(histories);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar históricos" });
    }
  },

  // Buscar um histórico específico por ID
  async show(req: Request, res: Response) {
    try {
      const history = await History.findById(req.params.id)
        .populate({
          path: "users.id",
          select: "_id name profile"
        })
        .populate("ticket.approver", "name");
      
      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }
      
      return res.json(history);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  },

  // Criar um novo histórico
  async create(req: Request, res: Response) {
    try {
      // Verifica e normaliza os users
      const users = Array.isArray(req.body.users) 
        ? req.body.users.map((user: any) => ({
            ...user,
            id: mongoose.Types.ObjectId.isValid(user?.id) 
              ? user.id instanceof mongoose.Types.ObjectId 
                ? user.id 
                : new mongoose.Types.ObjectId(user.id)
              : null,
            ticket: user?.ticket ? {
              paying: Boolean(user.ticket.paying),
              reason: user.ticket.reason || '',
              approver: mongoose.Types.ObjectId.isValid(user.ticket?.approver)
                ? new mongoose.Types.ObjectId(user.ticket.approver)
                : null
            } : undefined
          }))
          .filter((user: any ) => user.id !== null) // Filtra users com IDs inválidos
        : []; // Caso users não seja array, usa array vazio
  
      // Cria o objeto de dados
      const historyData = {
        ...req.body,
        users,
        joinedAt: req.body.joinedAt || new Date() // Valor padrão
      };
  
      // Validação adicional antes de criar
      if (!historyData.listId || !historyData.name || !historyData.eventName) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }
  
      const history = await History.create(historyData);
      return res.status(201).json(history);
  
    } catch (error) {
      console.error("Erro ao criar histórico:", error);
      
      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: "Erro de validação",
          details: error.message 
        });
      }
      
      return res.status(500).json({ 
        error: "Erro interno ao criar histórico",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Atualizar um histórico existente
  async updateOrAddUser(req: Request, res: Response) {
    const { historyId, userId } = req.params;
    const { firstRound, secondRound, examScore } = req.body;

    try {
      const history = await History.findById(historyId);
        if (!history) {
            return res.status(404).json({ error: "Histórico não encontrado" });
        }

        // Verifica se o usuário já existe no array
        const userIndex = history.users.findIndex(user => 
            user.id.toString() === userId
        );

      if (userIndex !== -1) {
            // Atualiza o usuário existente
            if (firstRound !== undefined) {
                history.users[userIndex].firstRound = firstRound;
            }
            if (secondRound !== undefined) {
                history.users[userIndex].secondRound = secondRound;
            }
            if (examScore !== undefined) {
                history.examScore = examScore;
            }
          } else {
            // Adiciona um novo usuário
            history.users.push({
                id: new mongoose.Types.ObjectId(userId),
                firstRound: firstRound || false,
                secondRound: secondRound || false,
                ticket: {
                    paying: false,
                    reason: "",
                    approver: null
                }
            });
        }
          const updatedHistory = await history.save();
        return res.json(updatedHistory);
    } catch (error) {
        console.error("Erro ao atualizar/adicionar usuário:", error);
        return res.status(500).json({ error: "Erro ao processar a requisição" });
    }
},

  // Deletar um histórico
  async delete(req: Request, res: Response) {
    try {
      const history = await History.findByIdAndDelete(req.params.id);

      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }

      return res.status(204).json();
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar histórico" });
    }
  },

  // Método adicional para adicionar um usuário ao histórico
  async addUser(req: Request, res: Response) {
    const { Id } = req.params;
    const { userId, firstRound, secondRound, free, reason, approver } = req.body;

    try {
      const history = await History.findByIdAndUpdate(
        Id,
        {
          $push: {
            users: {
              id: userId,
              firstRound: firstRound || false,
              secondRound: secondRound || false,
              ticket: {
                free: free,
                reason: reason,
                approver: approver
              }
            }
          }
        },
        { new: true }
      ).populate("users.id", "name profile");

      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }

      return res.json(history);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao adicionar usuário ao histórico" });
    }
  },

  async updateUserInHistory(req: Request, res: Response) {
    const { historyId, userId } = req.params;
    const { firstRound, secondRound, examScore } = req.body;

    try {
        const history = await History.findOneAndUpdate(
            {
                _id: historyId,
                "users.id": userId
            },
            {
                $set: {
                    "users.$.firstRound": firstRound,
                    "users.$.secondRound": secondRound,
                    "users.$.examScore": examScore
                }
            },
            { new: true }
        ).populate("users.id", "name profile");

        if (!history) {
            return res.status(404).json({ error: "Histórico ou usuário não encontrado" });
        }

        return res.json(history);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao atualizar usuário no histórico" });
    }
}
};