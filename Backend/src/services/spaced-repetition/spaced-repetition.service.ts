import prisma from '../../prisma/client';
import { ReviewQueueItem, Grade } from '../../schemas/decks.schemas';
import { Prisma } from '@prisma/client';

export class SpacedRepetitionService {
  /**
   * Obtém a fila de cartões para revisão
   * Prioriza: Frases Novas > Frases Esquecidas > Frases Atrasadas > Frases Devidas
   */
  async getReviewQueue(userId: string, deckId?: string, limit: number = 20): Promise<ReviewQueueItem[]> {
    const now = new Date();
    
    const where: Prisma.CardWhereInput = {
      userId,
      ...(deckId && { deckId })
    };

    // Buscar todos os cartões elegíveis para revisão
    const allCards = await prisma.card.findMany({
      where: {
        ...where,
        OR: [
          // Cartões novos (nunca revisados)
          { repetitions: 0 },
          // Cartões que devem ser revisados hoje ou antes
          { nextReviewDate: { lte: now } }
        ]
      },
      include: {
        phrase: true,
        deck: true
      },
      orderBy: [
        // Primeiro: cartões novos
        { repetitions: 'asc' },
        // Segundo: data de revisão (mais antigos primeiro)
        { nextReviewDate: 'asc' }
      ],
      take: limit * 2 // Buscar mais para ter opções de ordenação
    });

    // Ordenar manualmente seguindo a prioridade especificada
    const sortedCards = allCards.sort((a, b) => {
      const aIsNew = a.repetitions === 0;
      const bIsNew = b.repetitions === 0;
      
      // Prioridade 1: Cartões novos
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      
      // Se ambos são novos, ordenar por data de criação (mais antigos primeiro)
      if (aIsNew && bIsNew) {
        return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
      }
      
      // Prioridade 2: Cartões esquecidos (nota "AGAIN" ou "HARD" recentemente)
      // Isso seria detectado por repetitions === 0 ou 1 e lastReviewedAt recente
      // Por simplicidade, vamos considerar cartões com interval === 1 como "esquecidos"
      const aIsForgotten = a.interval === 1 && a.repetitions <= 1;
      const bIsForgotten = b.interval === 1 && b.repetitions <= 1;
      
      if (aIsForgotten && !bIsForgotten) return -1;
      if (!aIsForgotten && bIsForgotten) return 1;
      
      // Prioridade 3: Cartões atrasados (data de revisão passou)
      const aIsOverdue = a.nextReviewDate < now;
      const bIsOverdue = b.nextReviewDate < now;
      
      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;
      
      // Prioridade 4: Cartões devidos (data de revisão é hoje)
      // Ordenar por data de revisão (mais antigos primeiro)
      return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
    });

    // Limitar ao número solicitado
    const limitedCards = sortedCards.slice(0, limit);

    // Transformar em ReviewQueueItem
    return limitedCards.map(card => ({
      cardId: card.id,
      phraseId: card.phraseId,
      phrase: card.phrase.phrase,
      author: card.phrase.author,
      tags: card.phrase.tags,
      deckId: card.deckId,
      deckName: card.deck.name,
      easinessFactor: card.easinessFactor,
      interval: card.interval,
      repetitions: card.repetitions,
      nextReviewDate: card.nextReviewDate,
      lastReviewedAt: card.lastReviewedAt,
      isNew: card.repetitions === 0
    }));
  }

  /**
   * Processa uma revisão usando o algoritmo SM-2
   */
  async processReview(cardId: string, grade: Grade, userId: string) {
    // Buscar o card
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        phrase: true,
        deck: true
      }
    });

    if (!card) {
      throw new Error('Cartão não encontrado');
    }

    // Verificar se o card pertence ao usuário
    if (card.userId !== userId) {
      throw new Error('Usuário não autorizado');
    }

    // Salvar estado antigo para histórico
    const oldEasinessFactor = card.easinessFactor;
    const oldInterval = card.interval;
    const oldRepetitions = card.repetitions;

    // Aplicar algoritmo SM-2
    let newEasinessFactor = oldEasinessFactor;
    let newInterval: number;
    let newRepetitions: number;

    // Converter grade para número (1-4)
    const gradeNumber = grade === 'AGAIN' ? 1 : 
                       grade === 'HARD' ? 2 :
                       grade === 'GOOD' ? 3 : 4;

    // Calcular novo Fator de Facilidade (E-Factor) usando fórmula SM-2
    // Fórmula: E = E + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // onde q é a qualidade da resposta (1-4)
    const quality = gradeNumber;
    const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    
    newEasinessFactor = Math.max(1.3, oldEasinessFactor + efChange); // Mínimo 1.3

    // Calcular novo intervalo e repetições
    if (gradeNumber <= 2) {
      // AGAIN (1) ou HARD (2): reinicia o progresso
      if (gradeNumber === 1) {
        // Errou completamente: reinicia tudo
        newRepetitions = 0;
      } else {
        // Difícil: reinicia parcialmente
        newRepetitions = 0;
      }
      newInterval = 1; // Sempre 1 dia para recomeçar
    } else {
      // GOOD (3) ou EASY (4): progresso normal
      newRepetitions = oldRepetitions + 1;

      if (newRepetitions === 1) {
        // Primeiro acerto: 1 dia
        newInterval = 1;
      } else if (newRepetitions === 2) {
        // Segundo acerto: 6 dias
        newInterval = 6;
      } else {
        // Terceiro acerto em diante: Intervalo_Anterior × E-Factor
        newInterval = Math.round(oldInterval * newEasinessFactor);
      }
    }

    // Calcular nova data de revisão
    const now = new Date();
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Atualizar o card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        easinessFactor: newEasinessFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewDate: nextReviewDate,
        lastReviewedAt: now
      }
    });

    // Criar registro de revisão no histórico
    await prisma.review.create({
      data: {
        cardId: cardId,
        grade: grade,
        oldEasinessFactor: oldEasinessFactor,
        newEasinessFactor: newEasinessFactor,
        oldInterval: oldInterval,
        newInterval: newInterval
      }
    });

    return {
      card: updatedCard,
      changes: {
        easinessFactor: { old: oldEasinessFactor, new: newEasinessFactor },
        interval: { old: oldInterval, new: newInterval },
        repetitions: { old: oldRepetitions, new: newRepetitions },
        nextReviewDate: nextReviewDate
      }
    };
  }

  /**
   * Obtém estatísticas de revisão do usuário
   */
  async getReviewStats(userId: string, deckId?: string) {
    const where: Prisma.CardWhereInput = {
      userId,
      ...(deckId && { deckId })
    };

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const [totalCards, newCards, dueCards, overdueCards, stats] = await Promise.all([
      // Total de cartões
      prisma.card.count({ where }),
      
      // Cartões novos (nunca revisados)
      prisma.card.count({
        where: {
          ...where,
          repetitions: 0
        }
      }),
      
      // Cartões devidos hoje
      prisma.card.count({
        where: {
          ...where,
          nextReviewDate: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      
      // Cartões atrasados (passou da data)
      prisma.card.count({
        where: {
          ...where,
          nextReviewDate: {
            lt: startOfToday
          }
        }
      }),

      // Estatísticas gerais
      prisma.review.groupBy({
        by: ['grade'],
        where: {
          card: {
            userId,
            ...(deckId && { deckId })
          }
        },
        _count: {
          grade: true
        }
      })
    ]);

    const gradeStats = {
      AGAIN: 0,
      HARD: 0,
      GOOD: 0,
      EASY: 0
    };

    stats.forEach(stat => {
      gradeStats[stat.grade] = stat._count.grade;
    });

    return {
      totalCards,
      newCards,
      dueCards,
      overdueCards,
      gradeStats
    };
  }
}

