import { Router, Request, Response } from "express";

// Rotas
import phrasesRoutes from "./phrases.routes";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";

const router = Router();

// Registrar as rotas individuais
router.use('/phrases', phrasesRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

// Rota de health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok'
  });
});

export default router; 