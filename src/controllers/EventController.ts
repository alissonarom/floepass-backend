// src/backend/controllers/EventController.ts
import { Request, Response } from "express";
import { getModelForTenant } from "../utils/multiTenancy"; // Certifique-se de que o caminho está correto

export default {
  // Listar todos os eventos
  async index(req: Request, res: Response) {
    try {
        if (!req.auth) {
            return res.status(401).json({ error: "Não autenticado" });
        }

        const Event = getModelForTenant(req.auth.clientId, 'Event');
        const User = getModelForTenant(req.auth.clientId, 'User');
        const History = getModelForTenant(req.auth.clientId, 'History');

        const events = await Event.find()
            .populate({
                path: "owner",
                select: "name",
                model: User
            })
            .populate({
                path: "lists",
                populate: [
                    {
                        path: "owner",
                        select: "name cpf",
                        model: User
                    },
                    {
                        path: "historico",
                        model: History,
                        populate: {
                            path: "users.id",
                            model: User,
                            select: "name cpf gender phone" // selecione os campos que você precisa
                        }
                    }
                ]
            });

        return res.json(events);
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return res.status(500).json({ 
            error: "Erro ao buscar eventos",
            details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
        });
    }
},

  // Buscar um evento específico por ID
  async show(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const Event = getModelForTenant(req.auth.clientId, 'Event');
      const User = getModelForTenant(req.auth.clientId, 'User');
      const List = getModelForTenant(req.auth.clientId, 'List');

      const event = await Event.findById(req.params.id)
        .populate({
          path: "owner",
          model: User
        })
        .populate({
          path: "lists",
          model: List
        });
      
      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }
      
      return res.json(event);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      return res.status(500).json({ 
        error: "Erro ao buscar evento",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
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
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const Event = getModelForTenant(req.auth.clientId, 'Event');
      const event = await Event.create(req.body);
      
      return res.status(201).json(event);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      return res.status(500).json({ 
        error: "Erro ao criar evento",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Atualizar um evento existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { title, startDate, endDate, domain, lists } = req.body;

    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const Event = getModelForTenant(req.auth.clientId, 'Event');
      const event = await Event.findByIdAndUpdate(
        id,
        { 
          title, 
          startDate, 
          endDate, 
          domain,
          lists
        },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      return res.json(event);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      return res.status(500).json({ 
        error: "Erro ao atualizar evento",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  },

  // Deletar um evento
  async delete(req: Request, res: Response) {
    try {
      if (!req.auth) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const Event = getModelForTenant(req.auth.clientId, 'Event');
      const event = await Event.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({ error: "Evento não encontrado" });
      }

      return res.status(204).json();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      return res.status(500).json({ 
        error: "Erro ao deletar evento",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  }
};