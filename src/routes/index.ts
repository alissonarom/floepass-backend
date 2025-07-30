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

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.post('/login', loginHandler);

// Rotas de Usuários
router.post("/users", authenticate, createOrUpdateUserHandler); // Criar ou atualizar usuário
router.get("/users", authenticate, getAllUsersHandler); // Listar todos os usuários
router.get("/users/:cpf", authenticate, getUserByCpfHandler); // Buscar usuário por CPF
router.get("/usersById/:id", authenticate, getUserByIdHandler); // Buscar usuário por ID
router.post("/users/:cpf/penalties", authenticate, addPenaltyToUserHandler); // Adicionar penalidade

// Rotas de Promotores
router.get("/promoters", authenticate, PromoterController.index); // Listar promotores
router.post("/promoters", authenticate, PromoterController.create); // Criar promotor

// Rotas de Listas
router.get("/lists", authenticate, ListController.index);
router.post("/lists", authenticate, ListController.create); 
router.put("/lists/:id", authenticate, ListController.update);
router.delete("/lists/:listId/users/:userId", authenticate, removeUserListHandler);
// Rotas de Eventos
router.get("/events", authenticate, EventController.index); // Listar eventos
router.post("/events", authenticate, EventController.create); // Criar evento
router.put("/events/:id", authenticate, EventController.update); // Editar evento
router.delete("/events/:id", authenticate, EventController.delete); // Deletar evento
router.get("/events/:id", authenticate, EventController.show); // Buscar evento por ID

// Rotas de Histórico
router.get("/histories", authenticate, HistoryController.index); // Listar históricos
router.post("/histories", authenticate, HistoryController.create); // Criar histórico
router.get("/histories/:id", authenticate, HistoryController.show); // Buscar histórico por ID
router.put("/histories/:id", authenticate, HistoryController.updateOrAddUser); // Editar histórico
router.delete("/histories/:id", authenticate, HistoryController.delete); // Deletar histórico
router.get("/histories/:id", authenticate, HistoryController.addUser); // Adicionar usuário ao histórico
router.put("/histories/:historyId/users/:userId", authenticate, HistoryController.updateOrAddUser);

// Rotas de Listas
router.get("/generate-qrcode/:cpf", authenticate, getQRcodeUser); // Listar listas

export default router;
