import { z } from 'zod';

// Regex para validar CUID (formato usado pelo Prisma)
const CUID_REGEX = /^c[a-z0-9]{24}$/;

// Enum para as notas de revisão
export const GradeEnum = z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']);

// Schema para criar um baralho (deck)
export const createDeckSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do baralho é obrigatório')
    .min(2, 'Nome do baralho deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do baralho deve ter no máximo 100 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .nullable(),
  userId: z
    .string()
    .min(1, 'ID do usuário é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
});

// Schema para atualizar um baralho
export const updateDeckSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do baralho deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do baralho deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .nullable()
});

// Schema para adicionar uma frase a um baralho (criar um card)
// Nota: deckId vem dos parâmetros da URL, não do body
export const addPhraseToDeckSchema = z.object({
  phraseId: z
    .string()
    .min(1, 'ID da frase é obrigatório')
    .regex(CUID_REGEX, 'ID da frase deve ser um CUID válido')
});

// Schema para registrar uma revisão (grade)
export const reviewCardSchema = z.object({
  cardId: z
    .string()
    .min(1, 'ID do cartão é obrigatório')
    .regex(CUID_REGEX, 'ID do cartão deve ser um CUID válido'),
  grade: GradeEnum,
  userId: z
    .string()
    .min(1, 'ID do usuário é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
});

// Schema para parâmetros de ID do baralho
export const deckParamsSchema = z.object({
  id: z
    .string()
    .min(1, 'ID é obrigatório')
    .regex(CUID_REGEX, 'ID deve ser um CUID válido')
});

// Schema para query parameters de listagem de baralhos
export const listDecksQuerySchema = z.object({
  userId: z
    .string()
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(Number)
    .refine(n => n > 0, 'Página deve ser maior que 0')
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
    .optional()
    .default(10)
});

// Schema para obter cartões para revisão
export const getReviewQueueQuerySchema = z.object({
  deckId: z
    .string()
    .regex(CUID_REGEX, 'ID do baralho deve ser um CUID válido')
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limite deve ser entre 1 e 100')
    .optional()
    .default(20)
});

// Tipos TypeScript derivados dos schemas
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type AddPhraseToDeckInput = z.infer<typeof addPhraseToDeckSchema>;
export type ReviewCardInput = z.infer<typeof reviewCardSchema>;
export type DeckParams = z.infer<typeof deckParamsSchema>;
export type ListDecksQuery = z.infer<typeof listDecksQuerySchema>;
export type GetReviewQueueQuery = z.infer<typeof getReviewQueueQuerySchema>;
export type Grade = z.infer<typeof GradeEnum>;

// Interface para filtros de pesquisa de baralhos
export interface DeckFilters {
  userId?: string;
  page?: number;
  limit?: number;
}

// Interface para a fila de revisão
export interface ReviewQueueItem {
  cardId: string;
  phraseId: string;
  phrase: string;
  author: string;
  tags: string[];
  deckId: string;
  deckName: string;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedAt: Date | null;
  isNew: boolean; // true se nunca foi revisada (repetitions === 0)
}

