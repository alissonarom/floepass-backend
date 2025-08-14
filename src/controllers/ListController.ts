import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { generateId } from "../utils/id";

export default {
  async index(req: Request, res: Response) {
    console.log(`Buscando listas para o tenant: ${req.auth?.clientId}`);
    const clientId = req.auth?.clientId;
    console.log(`Tenant atual: ${clientId ?? "indefinido"}`);
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const lists = await prisma.list.findMany({
        where: { client_id: req.auth.clientId },
        orderBy: { createdAt: "desc" },
      });
      return res.json(lists);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar listas" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const listData = req.body ?? {};
      const name = listData.title || listData.name;
      if (!name) return res.status(400).json({ error: "Nome é obrigatório" });
      const created = await prisma.list.create({
        data: {
          id: generateId(),
          name,
          client_id: req.auth.clientId,
          eventId: listData.eventId ?? null,
          raw: listData,
        },
      });
      return res.status(201).json(created);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao criar lista", log: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const { id } = req.params;
      const exists = await prisma.list.findFirst({
        where: { id, client_id: req.auth.clientId },
      });
      if (!exists)
        return res.status(404).json({ error: "Lista não encontrada" });
      const updated = await prisma.list.update({
        where: { id },
        data: { ...req.body },
      });
      return res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
};
