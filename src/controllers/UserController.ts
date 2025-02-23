// src/backend/controllers/UserController.ts
import { Request, Response } from "express";
import User from "../models/User";

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
};
