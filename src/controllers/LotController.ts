import { Request, Response } from "express";
import Lot from "../models/Lot";

export default {
  // Listar todos os lotes
  async index(req: Request, res: Response) {
    try {
      const lots = await Lot.find().populate("event users");
      return res.json(lots);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar lotes" });
    }
  },

  // Criar novo lote
  async create(req: Request, res: Response) {
    try {
      const { title, quantity, value, event } = req.body;
      const lot = await Lot.create({ title, quantity, value, event });
      return res.status(201).json(lot);
    } catch (error) {
      return res.status(400).json({ error: "Falha ao criar lote" });
    }
  },

  // Buscar lote por ID
  async show(req: Request, res: Response) {
    try {
      const lot = await Lot.findById(req.params.id).populate("event users");
      if (!lot) {
        return res.status(404).json({ error: "Lote não encontrado" });
      }
      return res.json(lot);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar lote" });
    }
  },

  // Atualizar lote
  async update(req: Request, res: Response) {
    try {
      const { title, sold_out, quantity, value, event, users } = req.body;
      const lot = await Lot.findByIdAndUpdate(
        req.params.id,
        { title, sold_out, quantity, value, event, users },
        { new: true }
      );
      if (!lot) {
        return res.status(404).json({ error: "Lote não encontrado" });
      }
      return res.json(lot);
    } catch (error) {
      return res.status(400).json({ error: "Falha ao atualizar lote" });
    }
  },

  // Deletar lote
  async delete(req: Request, res: Response) {
    try {
      const lot = await Lot.findByIdAndDelete(req.params.id);
      if (!lot) {
        return res.status(404).json({ error: "Lote não encontrado" });
      }
      return res.json({ message: "Lote removido com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao remover lote" });
    }
  },

  // Adicionar usuário ao lote (compra)
  async addUser(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const lot = await Lot.findByIdAndUpdate(
        req.params.id,
        { $push: { users: userId } },
        { new: true }
      );
      if (!lot) {
        return res.status(404).json({ error: "Lote não encontrado" });
      }
      return res.json(lot);
    } catch (error) {
      return res.status(400).json({ error: "Falha ao adicionar usuário ao lote" });
    }
  },

  // Remover usuário do lote (cancelamento)
  async removeUser(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const lot = await Lot.findByIdAndUpdate(
        req.params.id,
        { $pull: { users: userId } },
        { new: true }
      );
      if (!lot) {
        return res.status(404).json({ error: "Lote não encontrado" });
      }
      return res.json(lot);
    } catch (error) {
      return res.status(400).json({ error: "Falha ao remover usuário do lote" });
    }
  },
};