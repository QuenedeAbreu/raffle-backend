// src/server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import raffleRoutes from './routes/raffleRoutes';
import paymentRoutes from './routes/paymentRoutes';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/payments', paymentRoutes);

// Rota para webhooks (Mercado Pago)
app.post('/api/webhook', paymentRoutes);

// Inicie o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});