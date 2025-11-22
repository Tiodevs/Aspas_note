import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput, OAuthSigninInput } from '../schemas/auth.schemas';

const authService = new AuthService();

export class AuthController {
    // Login
    login = async (req: Request, res: Response) => {
        const { email, senha }: LoginInput = req.body;

        try {
            const resultado = await authService.login(email, senha);
            res.json(resultado);
        } catch (error: any) {
            console.error('Erro ao autenticar usuário:', error);
            
            if (error.message === 'Email ou senha incorretos') {
                res.status(401).json({
                    error: 'Email ou senha incorretos',
                    code: 'INVALID_CREDENTIALS'
                });
                return;
            }

            if (error.message === 'Erro ao gerar token') {
                res.status(500).json({
                    error: 'Erro ao gerar token',
                    code: 'TOKEN_GENERATION_ERROR'
                });
                return;
            }
            
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Criar um novo usuário (registro)
    register = async (req: Request, res: Response) => {
        const { nome, email, senha, role }: RegisterInput = req.body;

        try {
            const usuario = await authService.createUser(nome, email, senha, role);
            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: usuario
            });
        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            
            if (error.message === 'Este email já está em uso.') {
                res.status(409).json({
                    error: 'Este email já está em uso',
                    code: 'EMAIL_ALREADY_EXISTS'
                });
                return;
            }

            if (error.message === 'Este nome de usuário já está em uso.') {
                res.status(409).json({
                    error: 'Este nome de usuário já está em uso',
                    code: 'USERNAME_ALREADY_EXISTS'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Solicitar recuperação de senha
    forgotPassword = async (req: Request, res: Response) => {
        const { email }: ForgotPasswordInput = req.body;

        try {
            const resultado = await authService.forgotPassword(email);
            res.json(resultado);
        } catch (error: any) {
            console.error('Erro ao solicitar recuperação de senha:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Redefinir senha com token
    resetPassword = async (req: Request, res: Response) => {
        const { token, novaSenha }: ResetPasswordInput = req.body;

        try {
            const resultado = await authService.resetPassword(token, novaSenha);
            res.json(resultado);
        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);

            if (error.message === 'Token inválido ou expirado') {
                res.status(400).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // OAuth signin (Google, etc.)
    oauthSignin = async (req: Request, res: Response) => {
        const { email, name, image, provider, providerId }: OAuthSigninInput = req.body;

        try {
            const resultado = await authService.oauthSignin(email, name, image, provider, providerId);
            res.json(resultado);
        } catch (error: any) {
            console.error('Erro no OAuth signin:', error);
            
            if (error.message === 'Erro ao gerar token') {
                res.status(500).json({
                    error: 'Erro ao gerar token',
                    code: 'TOKEN_GENERATION_ERROR'
                });
                return;
            }
            
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Obter dados do usuário atual (baseado no token JWT)
    me = async (req: Request, res: Response) => {
        try {
            // O middleware de autenticação já decodificou o token e colocou os dados em req.user
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const user = await authService.getUserById(userId);

            res.json({
                user: user
            });
        } catch (error: any) {
            console.error('Erro ao obter dados do usuário:', error);
            
            if (error.message === 'Usuário não encontrado') {
                res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
                return;
            }
            
            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }
} 