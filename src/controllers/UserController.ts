// src/backend/controllers/UserController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { formatUserProfile } from "../utils";

export default {
  async index(req: Request, res: Response) {
    const users = await User.find();
    return res.json(users);
  },

  async create(req: Request, res: Response) {
    const { name, cpf, birthDate, phone, gender, profile } = req.body;
    const user = await User.create({
      name,
      cpf,
      birthDate,
      phone,
      gender,
      profile,
    });
    return res.status(201).json(user);
  },

  async getProfileByCpf(req: Request, res: Response) {
    const { cpf } = req.query; // Captura o CPF da query string
    const cleanedCpf = String(cpf).replace(/\D/g, '');

    try {
      const user = await User.findOne({ cpf: cleanedCpf }); // Busca o usuário pelo CPF
      if (user) {
        const formattedUser = formatUserProfile(user);
        return res.status(200).json(formattedUser); // Retorna o perfil do usuário
      } else {
        return res.status(404).json({ error: "Usuário não encontrado" }); // Retorna erro se o usuário não for encontrado
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return res.status(500).json({ error: "Erro ao buscar perfil do usuário" });
    }
  },


};
