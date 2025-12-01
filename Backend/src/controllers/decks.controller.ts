import { Request, Response } from 'express';
import { DecksService } from '../services/decks/decks.service';
import { CreateDeckInput, UpdateDeckInput, AddPhraseToDeckInput, DeckFilters } from '../schemas/decks.schemas';

const decksService = new DecksService();

export class DecksController {
  createDeck = async (req: Request, res: Response) => {
    try {
      const data: CreateDeckInput = req.body;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      // Garantir que o userId do body seja o mesmo do usuário autenticado
      data.userId = userIdAuth;

      const deck = await decksService.createDeck(data);
      res.status(201).json(deck);
    } catch (error: any) {
      console.error('Erro ao criar baralho:', error);
      
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'USER_NOT_FOUND'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };

  listDecks = async (req: Request, res: Response) => {
    try {
      const filters: DeckFilters = req.query as any;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      // Se não foi especificado userId, usar o do usuário autenticado
      if (!filters.userId) {
        filters.userId = userIdAuth;
      }

      const resultado = await decksService.listDecks(filters, userIdAuth);
      res.status(200).json(resultado);
    } catch (error: any) {
      console.error('Erro ao listar baralhos:', error);

      if (error.message === 'Usuário não autenticado') {
        return res.status(401).json({
          error: error.message,
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'USER_NOT_FOUND'
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

  getDeckById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const deck = await decksService.getDeckById(id, userIdAuth);
      res.status(200).json(deck);
    } catch (error: any) {
      console.error('Erro ao buscar baralho:', error);

      if (error.message === 'Baralho não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'DECK_NOT_FOUND'
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

  updateDeck = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data: UpdateDeckInput = req.body;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const deck = await decksService.updateDeck(id, data, userIdAuth);
      res.status(200).json(deck);
    } catch (error: any) {
      console.error('Erro ao atualizar baralho:', error);

      if (error.message === 'Baralho não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'DECK_NOT_FOUND'
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

  deleteDeck = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const result = await decksService.deleteDeck(id, userIdAuth);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao deletar baralho:', error);

      if (error.message === 'Baralho não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'DECK_NOT_FOUND'
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

  addPhraseToDeck = async (req: Request, res: Response) => {
    try {
      const { id: deckId } = req.params; // deckId vem da URL
      const { phraseId } = req.body;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const data: AddPhraseToDeckInput = {
        phraseId,
        deckId,
        userId: userIdAuth
      };

      const card = await decksService.addPhraseToDeck(data);
      res.status(201).json(card);
    } catch (error: any) {
      console.error('Erro ao adicionar frase ao baralho:', error);

      if (error.message === 'Frase não encontrada') {
        return res.status(404).json({
          error: error.message,
          code: 'PHRASE_NOT_FOUND'
        });
      }

      if (error.message === 'Baralho não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'DECK_NOT_FOUND'
        });
      }

      if (error.message === 'Esta frase já está neste baralho') {
        return res.status(409).json({
          error: error.message,
          code: 'PHRASE_ALREADY_IN_DECK'
        });
      }

      if (error.message.includes('Usuário não autorizado')) {
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

  removePhraseFromDeck = async (req: Request, res: Response) => {
    try {
      const { cardId } = req.params;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const result = await decksService.removePhraseFromDeck(cardId, userIdAuth);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erro ao remover frase do baralho:', error);

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

  listDeckCards = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const userIdAuth = (req as any).user?.userId;

      if (!userIdAuth) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const resultado = await decksService.listDeckCards(id, userIdAuth, page, limit);
      res.status(200).json(resultado);
    } catch (error: any) {
      console.error('Erro ao listar cartões do baralho:', error);

      if (error.message === 'Baralho não encontrado') {
        return res.status(404).json({
          error: error.message,
          code: 'DECK_NOT_FOUND'
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
}

