import { z } from 'zod';

// Enum para roles de usuário
export enum Role {
    ADMIN = 'ADMIN',
    FREE = 'FREE',
    PRO = 'PRO',
}

// Função de validação de senha forte
const passwordValidation = z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<> etc.)');

// Schema para usuário completo
export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    username: z.string(),
    avatar: z.string(),
    bio: z.string(),
    password: z.string(),
    role: z.nativeEnum(Role)
});

// Schema para login
// Nota: No login não validamos a força da senha, apenas se foi informada
// pois a senha já foi validada no registro
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória')
});

// Schema para registro
export const registerSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  senha: passwordValidation,
  role: z
    .enum([Role.ADMIN, Role.FREE, Role.PRO])
    .optional()
    .default(Role.FREE)
});

// Schema para recuperação de senha
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
});

// Schema para redefinir senha
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token é obrigatório'),
  novaSenha: passwordValidation
});

// Schema para OAuth signin
export const oauthSigninSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .trim(),
  image: z
    .string()
    .url('URL da imagem inválida')
    .optional(),
  provider: z
    .string()
    .min(1, 'Provider é obrigatório'),
  providerId: z
    .string()
    .min(1, 'Provider ID é obrigatório')
});

// Tipos TypeScript derivados dos schemas
export type User = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OAuthSigninInput = z.infer<typeof oauthSigninSchema>; 