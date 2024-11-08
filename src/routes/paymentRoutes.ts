// src/routes/paymentRoutes.ts
import express from 'express';
import { createPayment, webhook } from '../controllers/paymentController';

const router = express.Router();

// Rota para criar um pagamento
router.post('/create', createPayment);

// Rota para receber webhooks do Mercado Pago
router.post('/webhook', webhook);

export default router;
