// src/routes/raffleRoutes.ts
import express,{ Request, Response,NextFunction} from 'express';
import { getRaffles, createRaffle, buyNumber } from '../controllers/raffleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Rota para obter todas as rifas
router.get('/', getRaffles);

// Rota para criar uma nova rifa (apenas administradores)
router.post('/', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
     res.status(403).json({ message: 'Acesso negado' });
  }
  next();
}, createRaffle);

// Rota para comprar um número de rifa
router.post('/buy', buyNumber);

export default router;
