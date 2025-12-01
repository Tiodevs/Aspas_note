import { Request, Response } from 'express';
import { SpacedRepetitionService } from '../services/spaced-repetition/spaced-repetition.service';
import { ReviewCardInput, GetReviewQueueQuery } from '../schemas/decks.schemas';

const spacedRepetitionService = new SpacedRepetitionService();

export class ReviewsController {
  getReviewQueue = async (req: Request, res: Response) => {
    try {
      const query: GetReviewQueueQuery = req.query as any;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const queue = await spacedRepetitionService.getReviewQueue(
        userIdAuth,
        query.deckId,
        query.limit
      );

      res.status(200).json({
        queue,
        count: queue.length
      });
    } catch (error: any) {
      console.error('Erro ao obter fila de revisão:', error);

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  processReview = async (req: Request, res: Response) => {
    try {
      const data: ReviewCardInput = req.body;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      // Garantir que o userId do body seja o mesmo do usuário autenticado
      data.userId = userIdAuth;

      const result = await spacedRepetitionService.processReview(
        data.cardId,
        data.grade,
        data.userId
      );

      res.status(200).json({
        success: true,
        card: result.card,
        changes: result.changes
      });
    } catch (error: any) {
      console.error('Erro ao processar revisão:', error);

      if (error.message === 'Cartão não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'CARD_NOT_FOUND'
        });
      }

      if (error.message === 'Usuário não autorizado') {
        return res.status(403).json({
          error: error.message,
          code: 'USER_NOT_AUTHORIZED'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  getReviewStats = async (req: Request, res: Response) => {
    try {
      const deckId = req.query.deckId as string | undefined;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const stats = await spacedRepetitionService.getReviewStats(
        userIdAuth,
        deckId
      );

      res.status(200).json(stats);
    } catch (error: any) {
      console.error('Erro ao obter estatísticas de revisão:', error);

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}

