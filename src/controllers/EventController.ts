// src/controllers/EventController.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { generateId } from "../utils/id";

export default {
  async index(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const events = await prisma.event.findMany({
        where: { client_id: clientId },
      });
      return res.json(events);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      return res.status(500).json({ error: "Erro ao buscar eventos" });
    }
  },

  async show(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const event = await prisma.event.findFirst({
        where: { id: req.params.id, client_id: clientId },
      });
      if (!event)
        return res.status(404).json({ error: "Evento não encontrado" });
      return res.json(event);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      return res.status(500).json({ error: "Erro ao buscar evento" });
    }
  },

  async create(req: Request, res: Response) {
    const { listDate, title, domain } = req.body;
    if (!listDate || !title) {
      return res.status(400).json({ error: "Nome e data são obrigatórios" });
    }
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const created = await prisma.event.create({
        data: {
          id: generateId(),
          name: title,
          date: new Date(listDate),
          client_id: clientId,
          raw: { ...req.body, domain },
        },
      });
      return res.status(201).json(created);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      return res.status(500).json({ error: "Erro ao criar evento" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, startDate, endDate, domain, lists } = req.body;
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const exists = await prisma.event.findFirst({
        where: { id, client_id: clientId },
      });
      if (!exists)
        return res.status(404).json({ error: "Evento não encontrado" });
      const updated = await prisma.event.update({
        where: { id },
        data: {
          name: title ?? exists.name,
          date: startDate ? new Date(startDate) : exists.date,
          raw: { ...(exists.raw as any), endDate, domain, lists },
        },
      });
      return res.json(updated);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      return res.status(500).json({ error: "Erro ao atualizar evento" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const exists = await prisma.event.findFirst({
        where: { id: req.params.id, client_id: clientId },
      });
      if (!exists)
        return res.status(404).json({ error: "Evento não encontrado" });
      await prisma.event.delete({ where: { id: exists.id } });
      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      return res.status(500).json({ error: "Erro ao deletar evento" });
    }
  },
};
