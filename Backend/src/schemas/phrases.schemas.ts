import { z } from 'zod';

// Regex para validar CUID (formato usado pelo Prisma)
const CUID_REGEX = /^c[a-z0-9]{24}$/;

// Schema para criar uma frase
export const createPhraseSchema = z.object({
  phrase: z
    .string()
    .min(1, 'Frase é obrigatória')
    .min(5, 'Frase deve ter pelo menos 5 caracteres')
    .max(1000, 'Frase deve ter no máximo 1000 caracteres')
    .trim(),
  author: z
    .string()
    .min(1, 'Autor é obrigatório')
    .min(2, 'Nome do autor deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .trim(),
  tags: z
    .array(z.string().trim().min(1, 'Tag não pode estar vazia'))
    .max(10, 'Máximo de 10 tags permitidas')
    .optional()
    .default([]),
  userId: z
    .string()
    .min(1, 'ID do usuário é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
});

// Schema para atualizar uma frase
export const updatePhraseSchema = z.object({
  phrase: z
    .string()
    .min(5, 'Frase deve ter pelo menos 5 caracteres')
    .max(1000, 'Frase deve ter no máximo 1000 caracteres')
    .trim()
    .optional(),
  author: z
    .string()
    .min(2, 'Nome do autor deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  tags: z
    .array(z.string().trim().min(1, 'Tag não pode estar vazia'))
    .max(10, 'Máximo de 10 tags permitidas')
    .optional()
});

// Schema para parâmetros de ID
export const phraseParamsSchema = z.object({
  id: z
    .string()
    .min(1, 'ID é obrigatório')
    .regex(CUID_REGEX, 'ID deve ser um CUID válido (formato: c + 24 caracteres alfanuméricos)')
});

// Schema para parâmetros de userId em rotas
export const userParamsSchema = z.object({
  userId: z
    .string()
    .min(1, 'ID do usuário é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido (formato: c + 24 caracteres alfanuméricos)')
});

// Schema para query parameters de listagem
export const listPhrasesQuerySchema = z.object({
  userId: z
    .string()
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
    .optional(),
  tag: z
    .string()
    .min(1, 'Tag não pode estar vazia')
    .max(50, 'Tag deve ter no máximo 50 caracteres')
    .trim()
    .optional(),
  author: z
    .string()
    .min(1, 'Nome do autor não pode estar vazio')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  search: z
    .string()
    .min(1, 'Termo de busca não pode estar vazio')
    .max(200, 'Termo de busca deve ter no máximo 200 caracteres')
    .trim()
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

// Tipos TypeScript derivados dos schemas
export type CreatePhraseInput = z.infer<typeof createPhraseSchema>;
export type UpdatePhraseInput = z.infer<typeof updatePhraseSchema>;
export type PhraseParams = z.infer<typeof phraseParamsSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type ListPhrasesQuery = z.infer<typeof listPhrasesQuerySchema>;

// Interface para filtros de pesquisa de frases
export interface PhraseFilters {
  userId?: string;
  author?: string;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

// Tipo para a frase completa (como vem do banco)
export interface PhraseResponse {
  id: string;
  phrase: string;
  author: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 