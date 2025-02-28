// src/backend/controllers/PromoterController.ts
import { Request, Response } from "express";
import User from "../models/User"; // Importe o modelo de usuário

export default {
  // Listar todos os promotores
  async index(req: Request, res: Response) {
    try {
      const promoters = await User.find({ profile: "Promotor" }); // Filtra por perfil "Promotor"
      return res.json(promoters);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar promotores" });
    }
  },

  // Criar um novo promotor
  async create(req: Request, res: Response) {
    const { name, cpf, birthDate, phone } = req.body;

    try {
      // Cria um usuário com o perfil de "Promotor"
      const promoter = await User.create({
        name,
        cpf,
        birthDate,
        phone,
        profile: "Promotor", // Define o perfil como "Promotor"
      });
      return res.status(201).json(promoter);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar promotor" });
    }
  },

  // Outras operações (atualizar, deletar, etc.) podem ser adicionadas aqui
};