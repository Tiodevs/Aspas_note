import { Router, Request, Response } from "express";

// Rotas
import phrasesRoutes from "./phrases.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Registrar as rotas individuais
router.use('/phrases', phrasesRoutes);
router.use('/auth', authRoutes);

// Rota de health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok'
  });
});

export default router; 