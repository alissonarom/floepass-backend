// src/controllers/PromoterController.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { generateId } from "../utils/id";

export default {
  async index(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const promoters = await prisma.user.findMany({
        where: { client_id: clientId, profile: "Promotor" },
      });
      const safe = promoters.map((u: any) => {
        const { password: _pw, ...rest } = u as any;
        return rest;
      });
      return res.json(safe);
    } catch (error) {
      console.error("Erro ao buscar promotores:", error);
      return res.status(500).json({ error: "Erro ao buscar promotores" });
    }
  },

  async create(req: Request, res: Response) {
    const { name, cpf, birthDate, phone } = req.body;
    if (!name || !cpf || !birthDate || !phone) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios" });
    }
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const exists = await prisma.user.findFirst({
        where: { client_id: clientId, cpf },
      });
      if (exists)
        return res
          .status(400)
          .json({ error: "Já existe um usuário com este CPF" });
      const created = await prisma.user.create({
        data: {
          id: generateId(),
          name,
          cpf,
          birthDate: new Date(birthDate),
          phone,
          profile: "Promotor",
          client_id: clientId,
          gender: "N/A",
          anniversary: false,
          cash: 0,
        },
      });
      const { password, ...safe } = created as any;
      return res.status(201).json(safe);
    } catch (error) {
      console.error("Erro ao criar promotor:", error);
      return res.status(500).json({ error: "Erro ao criar promotor" });
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, birthDate, phone } = req.body;
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const promoter = await prisma.user.findFirst({
        where: { id, client_id: clientId, profile: "Promotor" },
      });
      if (!promoter)
        return res.status(404).json({ error: "Promotor não encontrado" });
      const updated = await prisma.user.update({
        where: { id },
        data: {
          name,
          birthDate: birthDate ? new Date(birthDate) : null,
          phone,
        },
      });
      const { password, ...safe } = updated as any;
      return res.json(safe);
    } catch (error) {
      console.error("Erro ao atualizar promotor:", error);
      return res.status(500).json({ error: "Erro ao atualizar promotor" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const promoter = await prisma.user.findFirst({
        where: { id: req.params.id, client_id: clientId, profile: "Promotor" },
      });
      if (!promoter)
        return res.status(404).json({ error: "Promotor não encontrado" });
      await prisma.user.delete({ where: { id: promoter.id } });
      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar promotor:", error);
      return res.status(500).json({ error: "Erro ao deletar promotor" });
    }
  },

  async show(req: Request, res: Response) {
    try {
      if (!req.auth) return res.status(401).json({ error: "Não autenticado" });
      const clientId = req.auth.clientId;
      const promoter = await prisma.user.findFirst({
        where: { id: req.params.id, client_id: clientId, profile: "Promotor" },
      });
      if (!promoter)
        return res.status(404).json({ error: "Promotor não encontrado" });
      const { password, ...safe } = promoter as any;
      return res.json(safe);
    } catch (error) {
      console.error("Erro ao buscar promotor:", error);
      return res.status(500).json({ error: "Erro ao buscar promotor" });
    }
  },
};
