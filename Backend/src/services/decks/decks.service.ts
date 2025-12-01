import prisma from '../../prisma/client';
import { CreateDeckInput, UpdateDeckInput, AddPhraseToDeckInput, DeckFilters } from '../../schemas/decks.schemas';
import Log from '../../models/Log';

export class DecksService {
  /**
   * Cria um novo baralho (deck)
   */
  async createDeck(data: CreateDeckInput) {
    const { name, description, userId } = data;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const deck = await prisma.deck.create({
      data: {
        name,
        description: description || null,
        userId
      }
    });

    // Registrar Log no MongoDB (Fire and Forget)
    Log.create({
      action: 'CREATE_DECK',
      userId: userId,
      details: {
        deckId: deck.id,
        title: name
      }
    }).then(() => console.log('📝 Log registrado no MongoDB'))
      .catch(err => console.error('Erro ao registrar log:', err));

    return deck;
  }

  /**
   * Lista baralhos do usuário com paginação
   */
  async listDecks(filters: DeckFilters, userIdAuth: string) {
    const { userId, page = 1, limit = 10 } = filters;

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

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [decks, total] = await Promise.all([
      prisma.deck.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { cards: true }
          }
        }
      }),
      prisma.deck.count({ where })
    ]);

    return {
      decks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Busca um baralho por ID
   */
  async getDeckById(deckId: string, userIdAuth: string) {
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        _count: {
          select: { cards: true }
        },
        cards: {
          include: {
            phrase: true
          },
          take: 10, // Limitar cartões retornados para não sobrecarregar
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!deck) {
      throw new Error('Baralho não encontrado');
    }

    // Verificar se o usuário tem acesso ao baralho
    if (deck.userId !== userIdAuth) {
      const user = await prisma.user.findUnique({
        where: { id: userIdAuth }
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Usuário não autorizado');
      }
    }

    return deck;
  }

  /**
   * Atualiza um baralho
   */
  async updateDeck(deckId: string, data: UpdateDeckInput, userIdAuth: string) {
    // Verificar se o baralho existe e pertence ao usuário
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck) {
      throw new Error('Baralho não encontrado');
    }

    if (deck.userId !== userIdAuth) {
      const user = await prisma.user.findUnique({
        where: { id: userIdAuth }
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Usuário não autorizado');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: updateData
    });

    // Registrar Log no MongoDB (Fire and Forget)
    Log.create({
      action: 'UPDATE_DECK',
      userId: userIdAuth,
      details: {
        deckId: updatedDeck.id,
        title: updatedDeck.name
      }
    }).then(() => console.log('📝 Log registrado no MongoDB'))
      .catch(err => console.error('Erro ao registrar log:', err));

    return updatedDeck;
  }

  /**
   * Deleta um baralho
   */
  async deleteDeck(deckId: string, userIdAuth: string) {
    // Verificar se o baralho existe e pertence ao usuário
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck) {
      throw new Error('Baralho não encontrado');
    }

    if (deck.userId !== userIdAuth) {
      const user = await prisma.user.findUnique({
        where: { id: userIdAuth }
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Usuário não autorizado');
      }
    }

    await prisma.deck.delete({
      where: { id: deckId }
    });

    // Registrar Log no MongoDB (Fire and Forget)
    Log.create({
      action: 'DELETE_DECK',
      userId: userIdAuth,
      details: {
        deckId: deck.id,
        title: deck.name
      }
    }).then(() => console.log('📝 Log registrado no MongoDB'))
      .catch(err => console.error('Erro ao registrar log:', err));

    return { message: 'Baralho deletado com sucesso' };
  }

  /**
   * Adiciona uma frase a um baralho (cria um card)
   */
  async addPhraseToDeck(data: AddPhraseToDeckInput) {
    const { phraseId, deckId, userId } = data;

    // Verificar se a frase existe e pertence ao usuário
    const phrase = await prisma.phrase.findUnique({
      where: { id: phraseId }
    });

    if (!phrase) {
      throw new Error('Frase não encontrada');
    }

    // Verificar se o baralho existe e pertence ao usuário
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck) {
      throw new Error('Baralho não encontrado');
    }

    if (deck.userId !== userId) {
      throw new Error('Usuário não autorizado para adicionar frases neste baralho');
    }

    // Verificar se já existe um card para esta frase neste baralho
    const existingCard = await prisma.card.findUnique({
      where: {
        userId_phraseId_deckId: {
          userId,
          phraseId,
          deckId
        }
      }
    });

    if (existingCard) {
      throw new Error('Esta frase já está neste baralho');
    }

    // Criar o card com valores iniciais do SM-2
    const card = await prisma.card.create({
      data: {
        phraseId,
        deckId,
        userId,
        easinessFactor: 2.5, // Valor inicial padrão
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date() // Pode ser revisado imediatamente
      },
      include: {
        phrase: true,
        deck: true
      }
    });

    // Registrar Log no MongoDB (Fire and Forget)
    Log.create({
      action: 'ADD_PHRASE_TO_DECK',
      userId: userId,
      details: {
        cardId: card.id,
        deckId: deck.id,
        phraseId: phrase.id
      }
    }).then(() => console.log('📝 Log registrado no MongoDB'))
      .catch(err => console.error('Erro ao registrar log:', err));

    return card;
  }

  /**
   * Remove uma frase de um baralho (deleta um card)
   */
  async removePhraseFromDeck(cardId: string, userIdAuth: string) {
    // Verificar se o card existe
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { deck: true }
    });

    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    // Verificar se o usuário tem permissão
    if (card.userId !== userIdAuth) {
      const user = await prisma.user.findUnique({
        where: { id: userIdAuth }
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Usuário não autorizado');
      }
    }

    await prisma.card.delete({
      where: { id: cardId }
    });

    // Registrar Log no MongoDB (Fire and Forget)
    Log.create({
      action: 'REMOVE_PHRASE_FROM_DECK',
      userId: userIdAuth,
      details: {
        cardId: card.id,
        deckId: card.deckId,
        phraseId: card.phraseId
      }
    }).then(() => console.log('📝 Log registrado no MongoDB'))
      .catch(err => console.error('Erro ao registrar log:', err));

    return { message: 'Frase removida do baralho com sucesso' };
  }

  /**
   * Lista os cartões de um baralho
   */
  async listDeckCards(deckId: string, userIdAuth: string, page: number = 1, limit: number = 20) {
    // Verificar se o baralho existe
    const deck = await prisma.deck.findUnique({
      where: { id: deckId }
    });

    if (!deck) {
      throw new Error('Baralho não encontrado');
    }

    // Verificar se o usuário tem acesso
    if (deck.userId !== userIdAuth) {
      const user = await prisma.user.findUnique({
        where: { id: userIdAuth }
      });

      if (!user || user.role !== 'ADMIN') {
        throw new Error('Usuário não autorizado');
      }
    }

    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where: { deckId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          phrase: true
        }
      }),
      prisma.card.count({ where: { deckId } })
    ]);

    return {
      cards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

