// src/backend/controllers/PromoterController.ts
import { Request, Response } from "express";
import Promoter from "../models/Promoter";

export default {
  // Listar todos os promotores
  async index(req: Request, res: Response) {
    try {
      const promoters = await Promoter.find();
      return res.json(promoters);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar promotores" });
    }
  },

  // Criar um novo promotor
  async create(req: Request, res: Response) {
    const { name, cpf, birthDate, phone } = req.body;

    try {
      const promoter = await Promoter.create({ name, cpf, birthDate, phone });
      return res.status(201).json(promoter);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar promotor" });
    }
  },

  // Outras operações (atualizar, deletar, etc.) podem ser adicionadas aqui
};
