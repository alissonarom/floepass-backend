import { Router } from "express";
import UserController from "../controllers/UserController";
import PromoterController from "../controllers/PromoterController";
import ListController from "../controllers/ListController";

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

// Rotas de Usuários
router.get("/users", UserController.index); // Listar usuários
router.post("/users", UserController.create); // Criar usuário

// Rotas de Promotores
router.get("/promoters", PromoterController.index); // Listar promotores
router.post("/promoters", PromoterController.create); // Criar promotor

// Rotas de Listas
router.get("/lists", ListController.index); // Listar listas
router.post("/lists", ListController.create); // Criar lista

export default router;
