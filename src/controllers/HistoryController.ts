// src/backend/controllers/HistoryController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { getModelForTenant } from "../utils/multiTenancy"; // Ajuste o caminho conforme necessário

export default {
  // Listar todos os históricos
  async index(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const User = getModelForTenant(req.auth.clientId, 'User');

      const histories = await History.find()
        .populate({
          path: "users.id",
          model: User
        })
        .lean();
      
      return res.json(histories);
    } catch (error) {
      console.error("Erro ao buscar históricos:", error);
      return res.status(500).json({ 
        error: "Erro ao buscar históricos",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Buscar um histórico específico por ID
  async show(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const User = getModelForTenant(req.auth.clientId, 'User');

      const history = await History.findById(req.params.id)
        .populate({
          path: "users.id",
          select: "_id name profile",
          model: User
        })
        .populate({
          path: "ticket.approver",
          select: "name",
          model: User
        });
      
      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }
      
      return res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ 
        error: "Erro ao buscar histórico",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Criar um novo histórico
  async create(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const User = getModelForTenant(req.auth.clientId, 'User');

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
          .filter((user: any) => user.id !== null)
        : [];
  
      const historyData = {
        ...req.body,
        users,
        joinedAt: req.body.joinedAt || new Date()
      };
  
      if (!historyData.name || !historyData.eventName) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }
  
      const history = await History.create(historyData);
      return res.status(201).json(history);
  
    } catch (error) {
      console.error("Erro ao criar histórico:", error);
      
      if (error instanceof mongoose.Error.ValidationError) {
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
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const { historyId, userId } = req.params;
      const { firstRound, secondRound, examScore } = req.body;

      const history = await History.findById(historyId);
      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }

      const userIndex = history.users.findIndex((user: { id: { toString: () => string; }; }) => 
        user.id.toString() === userId
      );

      if (userIndex !== -1) {
        if (firstRound !== undefined) history.users[userIndex].firstRound = firstRound;
        if (secondRound !== undefined) history.users[userIndex].secondRound = secondRound;
        if (examScore !== undefined) history.users[userIndex].examScore = examScore;
      } else {
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
      return res.status(500).json({ 
        error: "Erro ao processar a requisição",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Deletar um histórico
  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const history = await History.findByIdAndDelete(req.params.id);

      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }

      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar histórico:", error);
      return res.status(500).json({ 
        error: "Erro ao deletar histórico",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Adicionar um usuário ao histórico
  async addUser(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const User = getModelForTenant(req.auth.clientId, 'User');
      const { Id } = req.params;
      const { userId, firstRound, secondRound, free, reason, approver } = req.body;

      const history = await History.findByIdAndUpdate(
        Id,
        {
          $push: {
            users: {
              id: new mongoose.Types.ObjectId(userId),
              firstRound: firstRound || false,
              secondRound: secondRound || false,
              ticket: {
                free: Boolean(free),
                reason: reason || '',
                approver: approver ? new mongoose.Types.ObjectId(approver) : null
              }
            }
          }
        },
        { new: true }
      ).populate({
        path: "users.id",
        select: "name profile",
        model: User
      });

      if (!history) {
        return res.status(404).json({ error: "Histórico não encontrado" });
      }

      return res.json(history);
    } catch (error) {
      console.error("Erro ao adicionar usuário ao histórico:", error);
      return res.status(500).json({ 
        error: "Erro ao adicionar usuário ao histórico",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Atualizar usuário no histórico
  async updateUserInHistory(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const History = getModelForTenant(req.auth.clientId, 'History');
      const User = getModelForTenant(req.auth.clientId, 'User');
      const { historyId, userId } = req.params;
      const { firstRound, secondRound, examScore } = req.body;

      const history = await History.findOneAndUpdate(
        {
          _id: historyId,
          "users.id": userId
        },
        {
          $set: {
            "users.$.firstRound": firstRound,
            "users.$.secondRound": secondRound,
            ...(examScore !== undefined && { "users.$.examScore": examScore })
          }
        },
        { new: true }
      ).populate({
        path: "users.id",
        select: "name profile",
        model: User
      });

      if (!history) {
        return res.status(404).json({ error: "Histórico ou usuário não encontrado" });
      }

      return res.json(history);
    } catch (error) {
      console.error("Erro ao atualizar usuário no histórico:", error);
      return res.status(500).json({ 
        error: "Erro ao atualizar usuário no histórico",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  }
};