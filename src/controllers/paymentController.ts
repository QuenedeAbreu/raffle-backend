// src/controllers/paymentController.ts
import { Request, Response, RequestHandler} from 'express';
import prisma from '../prisma';
import axios from 'axios';

const ASAS_BASE_URL = 'https://www.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

const asaas = axios.create({
  baseURL: ASAS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    access_token: ASAAS_API_KEY,
  },
});

// Criação de pagamento no Asaas
export const createPayment:RequestHandler = async (req: Request, res: Response) => {
  const { entryId, customerEmail, customerName } = req.body;

  if (!entryId || !customerEmail || !customerName) {
    res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    return;
  }

  // Obtenha a entrada da rifa
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { Raffle: true },
  });

  if (!entry) {
     res.status(404).json({ message: 'Entrada não encontrada' });
     return;
  }

  if (entry && entry.paid) {
     res.status(400).json({ message: 'Entrada já paga' });
     return;
  }

  try {
    // Crie o cliente no Asaas
    const customerResponse = await asaas.post('/customers', {
      name: customerName,
      email: customerEmail,
    });
    const customerId = customerResponse.data.id;

    // Crie a cobrança no Asaas
    const chargeResponse = await asaas.post('/payments', {
      customer: customerId,
      billingType: 'PIX', // ou 'PIX' dependendo do método de pagamento desejado
      value: entry ? entry.Raffle.price : 0,
      dueDate: new Date().toISOString().split('T')[0],
      description: `Rifa: ${entry? entry.Raffle.title : 0} - Número ${entry? entry.number: 0}`,
    });

    // Atualize a entrada com o paymentId
    await prisma.entry.update({
      where: { id: entryId },
      data: { paymentId: chargeResponse.data.id },
    });

    res.json({ paymentUrl: chargeResponse.data.invoiceUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar cobrança no Asaas' });
  }
};

// Webhook para processar notificações de pagamento do Asaas
export const webhook:RequestHandler = async (req: Request, res: Response) => {
  const event = req.body.event;
  const paymentId = req.body.paymentId;

  if (!event || !paymentId) {
    res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    return;
  }

  try {
    if (event === 'PAYMENT_RECEIVED') {
      // Atualize a entrada como paga
      const resultUpdate = await prisma.entry.updateMany({
        where: { paymentId: paymentId.toString() },
        data: { paid: true },
      });
      if (resultUpdate.count === 0) {
        res.status(404).json({ message: 'Pagamento não encontrado' });
        return;
      }

    }

    res.status(200).send('Pagamento recebido com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar webhook');
  }
};
