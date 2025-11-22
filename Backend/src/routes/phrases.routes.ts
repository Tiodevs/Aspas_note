import { Router } from 'express';
import { PhrasesController } from '../controllers/phrases.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createPhraseSchema, updatePhraseSchema, phraseParamsSchema, userParamsSchema } from '../schemas/phrases.schemas';

const router = Router();
const phrasesController = new PhrasesController();

// Rotas para filtros (devem vir antes das rotas com parâmetros)
router.get('/filters/authors', authenticateToken, phrasesController.getUniqueAuthors);
router.get('/filters/tags', authenticateToken, phrasesController.getUniqueTags);

// Rota para frases por usuário (deve vir antes da rota /:id)
router.get('/user/:userId', authenticateToken, validateParams(userParamsSchema), phrasesController.listPhrasesByUser);

// Rotas para frases    
router.post('/', authenticateToken, validate(createPhraseSchema), phrasesController.createPhrase);

router.get('/', authenticateToken, phrasesController.listPhrase);

router.get('/:id', authenticateToken, validateParams(phraseParamsSchema), phrasesController.getPhraseById);

router.put('/:id', authenticateToken, validateParams(phraseParamsSchema), validate(updatePhraseSchema), phrasesController.updatePhrase);

router.delete('/:id', authenticateToken, validateParams(phraseParamsSchema), phrasesController.deletePhrase);

export default router; 
