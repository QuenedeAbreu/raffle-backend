// raffleController.ts

// src/controllers/raffleController.ts
import { Request, RequestHandler, Response } from 'express';
import prisma from '../prisma';

export const getRaffles = async (req: Request, res: Response) => {
  const raffles = await prisma.raffle.findMany({
    include: { entries: true },
  });
  res.json(raffles);
};

export const createRaffle:RequestHandler = async (req: Request, res: Response) => {
  const { title, price, maxNumbers } = req.body;

  if (!title || !price || !maxNumbers) {
     res.status(400).json({ message: 'Título, preço e número máximo são obrigatórios' });
     return;
  }

  const raffle = await prisma.raffle.create({
    data: { title, price, maxNumbers },
  });

  res.status(201).json(raffle);
};

export const buyNumber:RequestHandler  = async (req: Request, res: Response) => {
  const { raffleId, number, customerEmail,customerName } = req.body;
  //Verifica se a rifa existe
  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
  });
  if (!raffle) {
     res.status(404).json({ message: 'Rifa não encontrada' });
     return;
  }
  
  // Verifique se o número é válido
  if (number < 1 || number > raffle.maxNumbers) {
     res.status(400).json({ message: 'Número inválido' });
     return;
  }
  // Verifique se o número já foi comprado
  const existingEntry = await prisma.entry.findUnique({
    where: { raffleId_number: { raffleId, number } },
  });

  if (existingEntry) {
     res.status(400).json({ message: 'Número já vendido' });
     return;
  }

  // Cria uma entrada com status não pago
  const entry = await prisma.entry.create({
    data: { raffleId, number, paid: false, customerEmail,customerName },
  });

  res.status(201).json(entry);
};
