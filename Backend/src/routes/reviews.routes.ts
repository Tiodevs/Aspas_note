import { Router } from 'express';
import { ReviewsController } from '../controllers/reviews.controller';
import { validate, validateQuery } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  reviewCardSchema,
  getReviewQueueQuerySchema
} from '../schemas/decks.schemas';

const router = Router();
const reviewsController = new ReviewsController();

// Rota para obter a fila de revisão
router.get('/queue', authenticateToken, validateQuery(getReviewQueueQuerySchema), reviewsController.getReviewQueue);

// Rota para processar uma revisão
router.post('/', authenticateToken, validate(reviewCardSchema), reviewsController.processReview);

// Rota para obter estatísticas de revisão
router.get('/stats', authenticateToken, reviewsController.getReviewStats);

export default router;

