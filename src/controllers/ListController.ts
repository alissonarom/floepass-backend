// src/backend/controllers/ListController.ts
import { Request, Response } from "express";
import List from "../models/List";

export default {
  // Listar todas as listas
  async index(req: Request, res: Response) {
    try {
      const lists = await List.find()
        .populate("promotor") // Popula informações do promotor
        .populate("users"); // Popula informações dos usuários
      return res.json(lists);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar listas" });
    }
  },

  // Criar uma nova lista
  async create(req: Request, res: Response) {
    const { title, promotor, startDate, endDate, users } = req.body;

    if (!title || !promotor || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    try {
      const lista = await List.create({
        title,
        promotor,
        startDate,
        endDate,
        users,
      });
      return res.status(201).json(lista);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar lista", log: error });
    }
  },

  // Editar uma lista existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, promotor, startDate, endDate, users } = req.body;

    try {
      const lista = await List.findByIdAndUpdate(
        id,
        { title, promotor, startDate, endDate, users },
        { new: true } // Retorna a lista atualizada
      );

      if (!lista) {
        return res.status(404).json({ error: "Lista não encontrada" });
      }

      return res.json(lista);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar lista" });
    }
  },
};