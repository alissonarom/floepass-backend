import { Router } from "express";
import {
    createOrUpdateUserHandler,
    getAllUsersHandler,
    getUserByCpfHandler,
    addPenaltyToUserHandler,
  } from "./../controllers/UserController";
import PromoterController from "../controllers/PromoterController";
import ListController from "../controllers/ListController";

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});


// Rotas de Usuários
router.post("/users", createOrUpdateUserHandler); // Criar ou atualizar usuário
router.get("/users", getAllUsersHandler); // Listar todos os usuários
router.get("/users/:cpf", getUserByCpfHandler); // Buscar usuário por CPF
router.post("/users/:cpf/penalties", addPenaltyToUserHandler); // Adicionar penalidade

// Rotas de Promotores
router.get("/promoters", PromoterController.index); // Listar promotores
router.post("/promoters", PromoterController.create); // Criar promotor

// Rotas de Listas
router.get("/lists", ListController.index); // Listar listas
router.post("/lists", ListController.create); // Criar lista
router.put("/lists/:id", ListController.update); // Editar lista

export default router;
