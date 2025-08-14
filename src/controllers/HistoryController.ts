// src/controllers/HistoryController.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { generateId } from "../utils/id";

export default {
  async index(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const histories = await prisma.history.findMany({
        where: { client_id: clientId },
        orderBy: { createdAt: "desc" },
      });
      return res.json(histories);
    } catch (error) {
      console.error("Erro ao buscar históricos:", error);
      return res.status(500).json({ error: "Erro ao buscar históricos" });
    }
  },

  async show(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const history = await prisma.history.findFirst({
        where: { id: req.params.id, client_id: clientId },
      });
      if (!history)
        return res.status(404).json({ error: "Histórico não encontrado" });
      return res.json(history);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ error: "Erro ao buscar histórico" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const { userId, type } = req.body;
      const created = await prisma.history.create({
        data: {
          id: generateId(),
          userId: userId ?? null,
          client_id: clientId,
          type: type ?? null,
          content: req.body,
        },
      });
      return res.status(201).json(created);
    } catch (error) {
      console.error("Erro ao criar histórico:", error);
      return res.status(500).json({ error: "Erro interno ao criar histórico" });
    }
  },

  async updateOrAddUser(_req: Request, res: Response) {
    return res
      .status(501)
      .json({ error: "Endpoint não suportado após migração para Postgres" });
  },

  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const exists = await prisma.history.findFirst({
        where: { id: req.params.id, client_id: clientId },
      });
      if (!exists)
        return res.status(404).json({ error: "Histórico não encontrado" });
      await prisma.history.delete({ where: { id: exists.id } });
      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar histórico:", error);
      return res.status(500).json({ error: "Erro ao deletar histórico" });
    }
  },

  async addUser(_req: Request, res: Response) {
    return res
      .status(501)
      .json({ error: "Endpoint não suportado após migração para Postgres" });
  },

  async updateUserInHistory(_req: Request, res: Response) {
    return res
      .status(501)
      .json({ error: "Endpoint não suportado após migração para Postgres" });
  },
};
