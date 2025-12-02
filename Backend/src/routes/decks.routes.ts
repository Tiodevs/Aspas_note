import { Router } from 'express';
import { DecksController } from '../controllers/decks.controller';
import { validate, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  createDeckSchema,
  updateDeckSchema,
  addPhraseToDeckSchema,
  deckParamsSchema,
  listDecksQuerySchema
} from '../schemas/decks.schemas';

const router = Router();
const decksController = new DecksController();

// Rotas para baralhos (decks)
router.post('/', authenticateToken, validate(createDeckSchema), decksController.createDeck);

router.get('/', authenticateToken, validateQuery(listDecksQuerySchema), decksController.listDecks);

router.get('/:id', authenticateToken, validateParams(deckParamsSchema), decksController.getDeckById);

router.put('/:id', authenticateToken, validateParams(deckParamsSchema), validate(updateDeckSchema), decksController.updateDeck);

router.delete('/:id', authenticateToken, validateParams(deckParamsSchema), decksController.deleteDeck);

// Rotas para cartões do baralho
router.get('/:id/cards', authenticateToken, validateParams(deckParamsSchema), decksController.listDeckCards);

router.post('/:id/phrases', authenticateToken, validateParams(deckParamsSchema), validate(addPhraseToDeckSchema), decksController.addPhraseToDeck);

router.delete('/cards/:cardId', authenticateToken, decksController.removePhraseFromDeck);

export default router;

