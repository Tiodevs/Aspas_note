import { Request, Response } from 'express';
import { PhrasesService } from '../services/phrases/phrases.service';
import { CreatePhraseInput, UpdatePhraseInput, PhraseFilters } from '../schemas/phrases.schemas';

// Instância do serviço de frases
const phrasesService = new PhrasesService();


export class PhrasesController {
    createPhrase = async (req: Request, res: Response) => {
        try {
            const { phrase, author, tags}: CreatePhraseInput = req.body;
            const userIdAuth = (req as any).user?.userId;

            const phraseCreated = await phrasesService.createPhrase(phrase, author, tags, userIdAuth);

            res.status(201).json(phraseCreated);
        } catch (error) {
            console.error('Erro ao criar frase:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'  
            });
            
            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
                return;
            }
            
            
        }
    }

    listPhrase = async (req: Request, res: Response) => {
        try {
            const filters: PhraseFilters = req.query as any;
            const userIdAuth = (req as any).user?.userId;

            const resultado = await phrasesService.listPhrase(filters, userIdAuth);

            if (resultado.phrases.length === 0) {
                res.status(200).json({
                    phrases: [],
                    pagination: resultado.pagination,
                    message: 'Nenhuma frase encontrada com os filtros aplicados'
                });
                return;
            }

            res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Erro ao listar frases:', error);

            if (error.message === 'Usuário não autenticado') {
                res.status(401).json({
                    error: 'Usuário não autenticado',
                    code: 'USER_NOT_AUTHENTICATED'
                });
                return;
            }

            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
                return;
            }

            if (error.message === 'Usuário não autorizado') {
                res.status(403).json({
                    error: 'Usuário não autorizado',
                    code: 'USER_NOT_AUTHORIZED'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    updatePhrase = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userIdAuth = (req as any).user?.userId;
            const updateData: UpdatePhraseInput = req.body;

            const updatedPhrase = await phrasesService.updatePhrase(id, updateData, userIdAuth);
            res.status(200).json(updatedPhrase);
        } catch (error: any) {
            console.error('Erro ao atualizar frase:', error);

            if (error.code === 'Frase não encontrada') { // Prisma error code for record not found
                res.status(404).json({
                    error: 'Frase não encontrada',
                    code: 'PHRASE_NOT_FOUND'
                });
                return;
            }

            if (error.message === 'Usuário não autorizado') {
                res.status(403).json({
                    error: 'Usuário não autorizado',
                    code: 'USER_NOT_AUTHORIZED'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    deletePhrase = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userIdAuth = (req as any).user?.userId;
            await phrasesService.deletePhrase(id, userIdAuth);
            res.status(204).send();
        } catch (error: any) {
            console.error('Erro ao deletar frase:', error);

            if (error.message === 'Frase não encontrada') { // Prisma error code for record not found
                res.status(404).json({
                    error: 'Frase não encontrada',
                    code: 'PHRASE_NOT_FOUND'
                });
                return;
            }

            if (error.message === 'Usuário não autorizado') {
                res.status(403).json({
                    error: 'Usuário não autorizado',
                    code: 'USER_NOT_AUTHORIZED'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Listar autores únicos
    getUniqueAuthors = async (req: Request, res: Response) => {
        try {
            const userIdAuth = (req as any).user?.userId;

            const authors = await phrasesService.getUniqueAuthors(
                userIdAuth
            );
            res.status(200).json(authors);
        } catch (error: any) {
            console.error('Erro ao buscar autores únicos:', error);

            if (error.message === 'Usuário não autenticado') {
                res.status(401).json({
                    error: 'Usuário não autenticado',
                    code: 'USER_NOT_AUTHENTICATED'
                });
                return;
            }

            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
                return;
            }

            if (error.message === 'Usuário não autorizado') {
                res.status(403).json({
                    error: 'Usuário não autorizado',
                    code: 'USER_NOT_AUTHORIZED'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Listar tags únicas
    getUniqueTags = async (req: Request, res: Response) => {
        try {
            const userIdAuth = (req as any).user?.userId;

            const tags = await phrasesService.getUniqueTags(
                userIdAuth
            );

            res.status(200).json(tags);
        } catch (error: any) {
            console.error('Erro ao buscar tags únicas:', error);

            if (error.message === 'Usuário não autenticado') {
                res.status(401).json({
                    error: 'Usuário não autenticado',
                    code: 'USER_NOT_AUTHENTICATED'
                });
                return;
            }

            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
                return;
            }

            if (error.message === 'Usuário não autorizado') {
                res.status(403).json({
                    error: 'Usuário não autorizado',
                    code: 'USER_NOT_AUTHORIZED'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Frases voltadas a parte social

    // Buscar feed de frases (frases das pessoas que o usuário segue)
    getFeed = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await phrasesService.getFeedPhrases(userId, page, limit);

            res.json(result);
        } catch (error: any) {
            console.error('Erro ao buscar feed:', error);
            
            if (error.message === 'Perfil não encontrado') {
                res.status(404).json({
                    error: 'Perfil não encontrado',
                    code: 'PROFILE_NOT_FOUND'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    listPhrasesByUser = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const phrases = await phrasesService.listPhrasesByUser(userId);
            res.status(200).json(phrases);
        } catch (error) {
            console.error('Erro ao listar frases do usuário:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    getPhraseById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const phrase = await phrasesService.getPhraseById(id);

            if (!phrase) {
                res.status(404).json({
                    error: 'Frase não encontrada',
                    code: 'PHRASE_NOT_FOUND'
                });
                return;
            }

            res.status(200).json(phrase);
        } catch (error) {
            console.error('Erro ao buscar frase:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }
}