import { z } from 'zod';

// Regex para validar CUID (formato usado pelo Prisma)
const CUID_REGEX = /^c[a-z0-9]{24}$/;

// Schema para criar perfil
export const createProfileSchema = z.object({
  avatar: z
    .union([
      z.string().url('URL do avatar inválida'),
      z.string().length(0).transform(() => null),
      z.null()
    ])
    .optional(),
  bio: z
    .union([
      z.string().max(500, 'Bio deve ter no máximo 500 caracteres'),
      z.string().length(0).transform(() => null),
      z.null()
    ])
    .optional()
});

// Schema para atualizar perfil
export const updateProfileSchema = z.object({
  avatar: z
    .union([
      z.string().url('URL do avatar inválida'),
      z.string().length(0).transform(() => null),
      z.null()
    ])
    .optional(),
  bio: z
    .union([
      z.string().max(500, 'Bio deve ter no máximo 500 caracteres'),
      z.string().length(0).transform(() => null),
      z.null()
    ])
    .optional()
});

// Schema para parâmetros de ID do perfil
export const profileIdParamsSchema = z.object({
  id: z
    .string()
    .min(1, 'ID é obrigatório')
    .regex(CUID_REGEX, 'ID deve ser um CUID válido (formato: c + 24 caracteres alfanuméricos)')
});

// Schema para parâmetros de userId
export const profileUserIdParamsSchema = z.object({
  userId: z
    .string()
    .min(1, 'ID do usuário é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido (formato: c + 24 caracteres alfanuméricos)')
});

// Schema para seguir/deixar de seguir
export const followProfileSchema = z.object({
  followingUserId: z
    .string()
    .min(1, 'ID do usuário a seguir é obrigatório')
    .regex(CUID_REGEX, 'ID do usuário deve ser um CUID válido')
});

// Tipos TypeScript derivados dos schemas
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfileIdParamsInput = z.infer<typeof profileIdParamsSchema>;
export type ProfileUserIdParamsInput = z.infer<typeof profileUserIdParamsSchema>;
export type FollowProfileInput = z.infer<typeof followProfileSchema>;

