import { Router } from "express";
import UserController from "../controllers/UserController";
import PromoterController from "../controllers/PromoterController";
import ListController from "../controllers/ListController";

const routes = Router();

// Rotas de Usuários
routes.get("/users", UserController.index); // Listar usuários
routes.post("/users", UserController.create); // Criar usuário

// Rotas de Promotores
routes.get("/promoters", PromoterController.index); // Listar promotores
routes.post("/promoters", PromoterController.create); // Criar promotor

// Rotas de Listas
routes.get("/lists", ListController.index); // Listar listas
routes.post("/lists", ListController.create); // Criar lista

export default routes;
