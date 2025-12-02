import { Router, Request, Response } from "express";

// Rotas
import phrasesRoutes from "./phrases.routes";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import decksRoutes from "./decks.routes";
import reviewsRoutes from "./reviews.routes";
import aiRoutes from "./ai.routes";

const router = Router();

// Registrar as rotas individuais
router.use('/phrases', phrasesRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/decks', decksRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/ai', aiRoutes);

// Rota de health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok'
  });
});

export default router; 