// src/backend/controllers/PromoterController.ts
import { Request, Response } from "express";
import { getModelForTenant } from "../utils/multiTenancy";

export default {
  // Listar todos os promotores
  async index(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const User = getModelForTenant(req.auth.clientId, 'User');
      const promoters = await User.find({ profile: "Promotor" })
        .select('-password') // Remove o campo de senha da resposta
        .lean();

      return res.json(promoters);
    } catch (error) {
      console.error("Erro ao buscar promotores:", error);
      return res.status(500).json({ 
        error: "Erro ao buscar promotores",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Criar um novo promotor
  async create(req: Request, res: Response) {
    const { name, cpf, birthDate, phone } = req.body;

    // Validação básica
    if (!name || !cpf || !birthDate || !phone) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const User = getModelForTenant(req.auth.clientId, 'User');
      
      // Verifica se já existe um usuário com o mesmo CPF
      const existingUser = await User.findOne({ cpf });
      if (existingUser) {
        return res.status(400).json({ error: "Já existe um usuário com este CPF" });
      }

      const promoter = await User.create({
        name,
        cpf,
        birthDate,
        phone,
        profile: "Promotor",
        client_id: req.auth.clientId // Garante que o promotor pertence ao tenant correto
      });

      // Remove a senha (caso tenha sido definida por padrão) antes de retornar
      const promoterWithoutPassword = promoter.toObject();
      delete promoterWithoutPassword.password;

      return res.status(201).json(promoterWithoutPassword);
    } catch (error) {
      console.error("Erro ao criar promotor:", error);
      return res.status(500).json({ 
        error: "Erro ao criar promotor",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Atualizar um promotor existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, birthDate, phone } = req.body;

    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const User = getModelForTenant(req.auth.clientId, 'User');
      
      const updatedPromoter = await User.findByIdAndUpdate(
        id,
        { 
          name,
          birthDate,
          phone,
          // Não permitimos alterar o CPF ou perfil aqui
        },
        { new: true }
      ).select('-password');

      if (!updatedPromoter) {
        return res.status(404).json({ error: "Promotor não encontrado" });
      }

      return res.json(updatedPromoter);
    } catch (error) {
      console.error("Erro ao atualizar promotor:", error);
      return res.status(500).json({ 
        error: "Erro ao atualizar promotor",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Deletar um promotor
  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const User = getModelForTenant(req.auth.clientId, 'User');
      const promoter = await User.findByIdAndDelete(req.params.id);

      if (!promoter) {
        return res.status(404).json({ error: "Promotor não encontrado" });
      }

      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar promotor:", error);
      return res.status(500).json({ 
        error: "Erro ao deletar promotor",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Buscar um promotor específico por ID
  async show(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const User = getModelForTenant(req.auth.clientId, 'User');
      const promoter = await User.findOne({
        _id: req.params.id,
        profile: "Promotor"
      }).select('-password');

      if (!promoter) {
        return res.status(404).json({ error: "Promotor não encontrado" });
      }

      return res.json(promoter);
    } catch (error) {
      console.error("Erro ao buscar promotor:", error);
      return res.status(500).json({ 
        error: "Erro ao buscar promotor",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  }
};