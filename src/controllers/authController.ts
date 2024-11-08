// src/controllers/authController.ts
import {RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const register: RequestHandler = async (req, res) => {
  const { email, password, isAdmin } = req.body;
  if (!email || !password) {
     res.status(400).json({ message: 'Email e senha são obrigatórios' });
     return;
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
       res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, isAdmin: isAdmin || false },
    });

     res.status(201).json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
     res.status(400).json({ message: 'Email e senha são obrigatórios' });
     return
  }
  const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }

    if(user){

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    
      const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_SECRET, {
        expiresIn: '1h',
      });
    
      res.json({ token });
    }
    else{
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  }