// src/routes/authRoutes.ts
import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// Rota para registro de usuários (pode ser desabilitada em produção)
router.post('/register', register);

// Rota para login de usuários
router.post('/login', login);

export default router;