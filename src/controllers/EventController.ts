// src/backend/controllers/EventController.ts
import { Request, Response } from "express";
import Event from "../models/Event";

export default {
  // Listar todos os eventos
  async index(req: Request, res: Response) {
    try {
      const events = await Event.find()
        .populate("owner") // Popula informações do dono do evento
        .populate({
          path: "lists",
          populate: {
            path: "owner",
            select: "name cpf"
          }
        })
        .populate({
          path: 'lots',
          select: 'title sold_out quantity value users',
          populate: {
            path: 'users',
            select: 'name cpf' // Ajuste conforme seus campos de usuário
          }
        });
      return res.json(events);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar eventos" });
    }
  },

  // Buscar um evento específico por ID
  async show(req: Request, res: Response) {
    try {
      const event = await Event.findById(req.params.id)
        .populate("owner")
        .populate("lists")
        .populate({
          path: 'lots',
          select: 'title sold_out quantity value users',
          populate: {
            path: 'users',
            select: 'name cpf' // Ajuste conforme seus campos de usuário
          }
        });
      
      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      
      return res.json(event);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar evento" });
    }
  },

  // Criar um novo evento
  async create(req: Request, res: Response) {
    const { listDate, title, domain } = req.body;

    if (!listDate || !title || !domain) {
      return res
        .status(400)
        .json({ error: "Nome, Domínio, data da lista são obrigatórios" });
    }

    try {
      const event = await Event.create(req.body);
      return res.status(201).json(event);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar evento", log: error });
    }
  },

  // Atualizar um evento existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, startDate, endDate, domain, lists } = req.body;

    try {
      const event = await Event.findByIdAndUpdate(
        id,
        { 
          title, 
          startDate, 
          endDate, 
          domain,
          lists // Inclui o campo lists na atualização
        },
        { new: true } // Retorna o evento atualizado
      );

      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      return res.json(event);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar evento" });
    }
  },

  // Deletar um evento
  async delete(req: Request, res: Response) {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      return res.status(204).json();
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar evento" });
    }
  }
};