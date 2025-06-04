import { Router } from "express";
import {
    createOrUpdateUserHandler,
    getAllUsersHandler,
    getUserByCpfHandler,
    addPenaltyToUserHandler,
    removeUserListHandler,
    getQRcodeUser,
    getUserByIdHandler,
  } from "./../controllers/UserController";
import PromoterController from "../controllers/PromoterController";
import ListController from "../controllers/ListController";
import { authenticate } from '../utils';
import { loginHandler } from "../controllers/authController";
import EventController from "../controllers/EventController";
import HistoryController from "../controllers/HistoryController";
import LotController from "../controllers/LotController";

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.post('/login', loginHandler);

// Rotas de Usuários
router.post("/users", authenticate, createOrUpdateUserHandler); // Criar ou atualizar usuário
router.get("/users", getAllUsersHandler); // Listar todos os usuários
router.get("/users/:cpf", authenticate, getUserByCpfHandler); // Buscar usuário por CPF
router.get("/usersById/:id", authenticate, getUserByIdHandler); // Buscar usuário por ID
router.post("/users/:cpf/penalties", addPenaltyToUserHandler); // Adicionar penalidade

// Rotas de Promotores
router.get("/promoters", PromoterController.index); // Listar promotores
router.post("/promoters", PromoterController.create); // Criar promotor

// Rotas de Listas
router.get("/lists", ListController.index); // Listar listas
router.post("/lists", ListController.create); // Criar lista
router.put("/lists/:id", ListController.update); // Editar lista
router.delete("/lists/:listId/users/:userId", removeUserListHandler);
// Rotas de Eventos
router.get("/events", EventController.index); // Listar eventos
router.post("/events", EventController.create); // Criar evento
router.put("/events/:id", EventController.update); // Editar evento
router.delete("/events/:id", EventController.delete); // Deletar evento
router.get("/events/:id", EventController.show); // Buscar evento por ID

// Rotas de Histórico
router.get("/histories", HistoryController.index); // Listar históricos
router.post("/histories", HistoryController.create); // Criar histórico
router.get("/histories/:id", HistoryController.show); // Buscar histórico por ID
router.put("/histories/:id", HistoryController.updateOrAddUser); // Editar histórico
router.delete("/histories/:id", HistoryController.delete); // Deletar histórico
router.get("/histories/:id", HistoryController.addUser); // Adicionar usuário ao histórico
router.put("/histories/:historyId/users/:userId", HistoryController.updateOrAddUser);

// Rotas CRUD básicas
router.get("/lots", LotController.index); // Listar todos os lotes
router.post("/lots", LotController.create); // Criar novo lote
router.get("/lots/:id", LotController.show); // Buscar lote por ID
router.put("/lots/:id", LotController.update); // Atualizar lote
router.delete("/lots/:id", LotController.delete); // Deletar lote
router.post("/lots/:id/add-user", LotController.addUser); // Adicionar usuário ao lote
router.post("/lots/:id/remove-user", LotController.removeUser); // Remover usuário do lote

// Rotas de Listas
router.get("/generate-qrcode/:cpf", getQRcodeUser); // Listar listas

export default router;
