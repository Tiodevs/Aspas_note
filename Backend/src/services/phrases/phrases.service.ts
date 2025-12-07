
import prisma from '../../prisma/client';
import { CreatePhraseInput, UpdatePhraseInput, PhraseResponse, PhraseFilters } from '../../schemas/phrases.schemas';
import Log from '../../models/Log';

export class PhrasesService {

    async createPhrase(phrase: string, author: string, tags: string[], userId: string): Promise<PhraseResponse> {
        const newPhrase = await prisma.phrase.create({
            data: {
                phrase,
                author,
                tags,
                userId
            }
        });

        // Registrar Log no MongoDB (Fire and Forget)
        Log.create({
            action: 'CREATE_PHRASE',
            userId: userId,
            details: {
                phraseId: newPhrase.id,
                title: phrase.substring(0, 20) + '...'
            }
        }).then(() => console.log('📝 Log registrado no MongoDB'))
            .catch(err => console.error('Erro ao registrar log:', err));

        return newPhrase;
    }

    async listPhrase(filters: PhraseFilters, userIdAuth: string) {
        const { userId, author, search, tag, page, limit } = filters;

        // Verificar se userIdAuth foi fornecido
        if (!userIdAuth) {
            throw new Error('Usuário não autenticado');
        }

        // Verificar se o usuário é admin ou o userId é o mesmo passado no filters
        const user = await prisma.user.findUnique({
            where: { id: userIdAuth }
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (user.role !== 'ADMIN' && userId !== userIdAuth) {
            throw new Error('Usuário não autorizado');
        }

        // Garantir que page e limit sejam números
        const currentPage = page ? Number(page) : 1;
        const currentLimit = limit ? Number(limit) : 10;

        const skip = (currentPage - 1) * currentLimit;

        const where: any = {};

        // Filtro por usuário
        if (userId) {
            where.userId = userId;
        }

        // Filtro por autor
        if (author) {
            where.author = {
                contains: author,
                mode: 'insensitive'
            };
        }

        // Filtro por tag
        if (tag) {
            where.tags = {
                has: tag
            };
        }

        // Filtro de busca geral (busca no conteúdo da frase e no autor)
        if (search) {
            where.OR = [
                {
                    phrase: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    author: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        const [phrases, total] = await Promise.all([
            prisma.phrase.findMany({
                where,
                skip,
                take: currentLimit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.phrase.count({ where })
        ]);

        return {
            phrases,
            pagination: {
                page: currentPage,
                limit: currentLimit,
                total,
                pages: Math.ceil(total / currentLimit)
            }
        };
    }

    async listPhrasesByUser(userId: string): Promise<PhraseResponse[]> {
        const phrases = await prisma.phrase.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return phrases;
    }

    async getPhraseById(id: string): Promise<PhraseResponse | null> {
        const phrase = await prisma.phrase.findUnique({
            where: { id },
        });
        return phrase;
    }

    async updatePhrase(id: string, updateData: UpdatePhraseInput): Promise<PhraseResponse> {
        const updatedPhrase = await prisma.phrase.update({
            where: { id },
            data: updateData
        });
        return updatedPhrase;
    }

    async deletePhrase(id: string): Promise<void> {
        await prisma.phrase.delete({
            where: { id }
        });
    }

    // Buscar todos os autores únicos
    async getUniqueAuthors(userIdAuth: string): Promise<string[]> {
        // Verificar se userIdAuth foi fornecido
        if (!userIdAuth) {
            throw new Error('Usuário não autenticado');
        }

        const user = await prisma.user.findUnique({
            where: { id: userIdAuth }
        });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const authors = await prisma.phrase.findMany({
            where: {
                userId: userIdAuth
            },
            select: { author: true }
        });

        return [...new Set(authors.map(item => item.author))].filter(author => author && author.trim() !== '');
    }

    // Buscar todas as tags únicas
    async getUniqueTags(userId?: string, userIdAuth?: string): Promise<string[]> {
        // Verificar se userIdAuth foi fornecido
        if (!userIdAuth) {
            throw new Error('Usuário não autenticado');
        }

        // Se userId foi fornecido, fazer validação de autorização
        if (userId) {
            // Verificar se o usuário é admin ou o userId é o mesmo passado no filtro
            const user = await prisma.user.findUnique({
                where: { id: userIdAuth }
            });

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            if (user.role !== 'ADMIN' && userId !== userIdAuth) {
                throw new Error('Usuário não autorizado');
            }
        }

        const where: any = {};

        // Filtrar por usuário se especificado
        if (userId) {
            where.userId = userId;
        }

        const phrases = await prisma.phrase.findMany({
            where,
            select: {
                tags: true
            }
        });

        // Extrair todas as tags e remover duplicatas
        const allTags = phrases.flatMap(phrase => phrase.tags);
        const uniqueTags = [...new Set(allTags)].filter(tag => tag.trim() !== '');

        return uniqueTags;
    }

    // Buscar frases do feed (frases das pessoas que o usuário segue)
    async getFeedPhrases(userId: string, page: number = 1, limit: number = 20) {
        try {
            // Buscar o perfil do usuário
            const userProfile = await prisma.profile.findUnique({
                where: { userId }
            });

            if (!userProfile) {
                throw new Error('Perfil não encontrado');
            }

            // Buscar os IDs dos perfis que o usuário está seguindo
            const following = await prisma.follow.findMany({
                where: {
                    followerId: userProfile.id
                },
                select: {
                    followingId: true
                }
            });

            const followingProfileIds = following.map(f => f.followingId);

            // Se não está seguindo ninguém, retornar array vazio
            if (followingProfileIds.length === 0) {
                return {
                    phrases: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        pages: 0
                    }
                };
            }

            // Buscar os userIds dos perfis que está seguindo
            const followingProfiles = await prisma.profile.findMany({
                where: {
                    id: {
                        in: followingProfileIds
                    }
                },
                select: {
                    userId: true
                }
            });

            const followingUserIds = followingProfiles.map(p => p.userId);

            // Buscar frases desses usuários, ordenadas por data de criação (mais recentes primeiro)
            const skip = (page - 1) * limit;

            const [phrases, total] = await Promise.all([
                prisma.phrase.findMany({
                    where: {
                        userId: {
                            in: followingUserIds
                        }
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: limit
                }),
                prisma.phrase.count({
                    where: {
                        userId: {
                            in: followingUserIds
                        }
                    }
                })
            ]);

            const pages = Math.ceil(total / limit);

            return {
                phrases: phrases.map(phrase => ({
                    ...phrase,
                    user: phrase.user
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            };
        } catch (error) {
            console.error('Erro ao buscar frases do feed:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao buscar frases do feed');
        }
    }
}