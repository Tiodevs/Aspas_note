import jwt from 'jsonwebtoken';
import { compare, hash } from "bcryptjs";
import prisma from '../../prisma/client';
import { EmailService } from '../email/email.service';
import { envs } from '../../config/env';
import crypto from 'crypto';
import { Role } from '../../schemas/auth.schemas';

// Interface para o payload do token JWT
interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export class AuthService {

    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    // Realizar login
    async login(email: string, senha: string) {
        try {

            // Busca o usuário pelo email
            const usuario = await prisma.user.findUnique({
                where: { email }
            });

            if (!usuario) {
                throw new Error("Email ou senha incorretos");
            }

            // Ele faz a verificação se a senha criptografada é a mesma enviada pelo user 
            const passwordMatch = await compare(senha, usuario.password);

            if (!passwordMatch) {
                throw new Error("Email ou senha incorretos");
            }

            // Cria o token JWT
            const token = jwt.sign(
                {
                    userId: usuario.id,
                    email: usuario.email,
                    role: usuario.role
                },
                process.env.JWT_SECRET || 'seu_segredo_super_secreto',
                { expiresIn: '10d' }
            );

            if (!token) {
                throw new Error('Erro ao gerar token');
            }

            // Buscar perfil para incluir profileId
            let profileId = null;
            try {
                const profile = await prisma.profile.findUnique({
                    where: { userId: usuario.id },
                    select: { id: true }
                });
                profileId = profile?.id || null;
            } catch (profileError) {
                console.error('Erro ao buscar perfil no login:', profileError);
            }

            // Retorna o token e informações básicas do usuário
            return {
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.name,
                    email: usuario.email,
                    role: usuario.role,
                    profileId: profileId
                }
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro no processo de login');
        }
    }

    // Criar um novo usuário
    async createUser(username: string, email: string, password: string, role: Role) {
        try {
            // Verifica se já existe usuário com este email
            const usuarioExistente = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: email },
                        { username: username }
                    ]
                }
            });

            if (usuarioExistente) {
                if (usuarioExistente.email === email) {
                    throw new Error('Este email já está em uso.');
                }
                if (usuarioExistente.username === username) {
                    throw new Error('Este nome de usuário já está em uso.');
                }
            }

            // Cria a criptografia da senha
            const hashedPassword = await hash(password, 8);

            // Cria o novo usuário
            const novoUsuario = await prisma.user.create({
                data: {
                    username: username,
                    email,
                    password: hashedPassword,
                    role: role
                }
            });

            const user = await prisma.user.update({
                where: { id: novoUsuario.id },
                data: {
                    updatedBy: novoUsuario.email
                }
            });

            // Criar perfil automaticamente para o novo usuário
            try {
                await prisma.profile.create({
                    data: {
                        userId: user.id,
                        avatar: null,
                        bio: null
                    }
                });
            } catch (profileError) {
                // Se falhar ao criar perfil, loga o erro mas não falha a criação do usuário
                console.error('Erro ao criar perfil automaticamente:', profileError);
            }

            // Envio do email de boas-vindas de forma assíncrona
            this.emailService.enviarEmailBoasVindas(username, email)
                    .then(result => {
                        if (!result.success) {
                            console.warn(`Falha ao enviar email de boas-vindas para ${email}: ${result.message}`);
                        }
                    })
                    .catch(error => {
                        console.error(`Erro ao tentar enviar email de boas-vindas para ${email}:`, error);
                    });

            // Remove a senha antes de retornar
            const { password: _, ...usuarioSemSenha } = user;
            return usuarioSemSenha;

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao criar usuário');
        }
    }

    // Solicitar recuperação de senha
    async forgotPassword(email: string) {
        try {

            const usuario = await prisma.user.findUnique({ where: { email } });

            if (!usuario) {
                return { message: 'Se esse email estiver cadastrado, você receberá instruções.' };
            }
            // Gerar token aleatório
            const token = crypto.randomBytes(32).toString('hex');

            // Salvar o token com expiração de 1 hora
            const expiresAt = new Date(Date.now() + 3600000); // 1 hora


            await prisma.passwordReset.create({
                data: {
                    id: crypto.randomUUID(),
                    email: usuario.email,
                    token: token,
                    expiresAt: expiresAt,
                    used: false,
                    createdAt: new Date()
                }
            });

            // Configurar o link de recuperação
            const resetLink = `${envs.server.host}/reset-password?token=${token}`;

            // Enviar email
            const emailResult = await this.emailService.enviarEmailRecuperacaoSenha(usuario.name || '', email, resetLink);
            if (!emailResult.success) {
                console.warn(`Falha ao enviar email de recuperação para ${email}: ${emailResult.message}`);
            }

            return { message: 'Instruções de recuperação enviadas para seu email.' };
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Erro ao processar solicitação de recuperação');
        }
    }

    // Redefinir senha com token
    async resetPassword(token: string, novaSenha: string) {
        try {

            const passwordReset = await prisma.passwordReset.findFirst({
                where: {
                    token: token,
                    used: false,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (!passwordReset) {
                throw new Error('Token inválido ou expirado');
            }

            // Criptografar nova senha
            const hashedPassword = await hash(novaSenha, 8);

            // Atualizar senha do usuário
            await prisma.user.update({
                where: { email: passwordReset.email },
                data: {
                    password: hashedPassword,
                    updatedBy: passwordReset.email
                }
            });

            // Marcar token como usado
            await prisma.passwordReset.update({
                where: { id: passwordReset.id },
                data: { used: true }
            });

            return { message: 'Senha atualizada com sucesso' };
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Erro ao redefinir senha');
        }
    }

    // OAuth signin - criar ou encontrar usuário com provider OAuth
    async oauthSignin(email: string, name: string, image: string | undefined, provider: string, providerId: string) {
        try {
            // Primeiro, verificar se já existe um usuário com esse email
            let usuario = await prisma.user.findUnique({
                where: { email }
            });

            // Se não existir, criar um novo usuário
            if (!usuario) {
                // Gerar um username único baseado no email
                const baseUsername = email.split('@')[0];
                let username = baseUsername;
                let counter = 1;

                // Verificar se o username já existe e gerar um único
                while (await prisma.user.findUnique({ where: { username } })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                usuario = await prisma.user.create({
                    data: {
                        email,
                        name,
                        username,
                        password: '', // OAuth users não precisam de senha
                        role: Role.FREE
                    }
                });

                // Criar perfil automaticamente com avatar do OAuth
                try {
                    await prisma.profile.create({
                        data: {
                            userId: usuario.id,
                            avatar: image || null,
                            bio: null
                        }
                    });
                } catch (profileError) {
                    console.error('Erro ao criar perfil automaticamente no OAuth:', profileError);
                }
            } else {
                // Se o usuário já existe, atualizar informações se necessário
                usuario = await prisma.user.update({
                    where: { id: usuario.id },
                    data: {
                        name // Atualizar nome se mudou
                    }
                });

                // Atualizar avatar no perfil se fornecido
                if (image) {
                    try {
                        const existingProfile = await prisma.profile.findUnique({
                            where: { userId: usuario.id }
                        });

                        if (existingProfile) {
                            await prisma.profile.update({
                                where: { userId: usuario.id },
                                data: { avatar: image }
                            });
                        } else {
                            // Se não tem perfil, criar um
                            await prisma.profile.create({
                                data: {
                                    userId: usuario.id,
                                    avatar: image,
                                    bio: null
                                }
                            });
                        }
                    } catch (profileError) {
                        console.error('Erro ao atualizar perfil no OAuth:', profileError);
                    }
                }
            }

            // Criar o token JWT
            const token = jwt.sign(
                {
                    userId: usuario.id,
                    email: usuario.email,
                    role: usuario.role
                },
                process.env.JWT_SECRET || 'seu_segredo_super_secreto',
                { expiresIn: '10d' }
            );

            if (!token) {
                throw new Error('Erro ao gerar token');
            }

            // Buscar perfil para incluir avatar e profileId
            let avatar = null;
            let profileId = null;
            try {
                const profile = await prisma.profile.findUnique({
                    where: { userId: usuario.id },
                    select: { id: true, avatar: true }
                });
                avatar = profile?.avatar || null;
                profileId = profile?.id || null;
            } catch (profileError) {
                console.error('Erro ao buscar perfil no OAuth:', profileError);
            }

            // Retornar token e informações do usuário
            return {
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.name,
                    email: usuario.email,
                    role: usuario.role,
                    avatar: avatar,
                    profileId: profileId
                }
            };
        } catch (error) {
            console.error('Erro no OAuth signin:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro no processo de OAuth signin');
        }
    }

    // Obter dados do usuário por ID (mantém retrocompatibilidade)
    async getUserById(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    username: true,
                    profile: {
                        select: {
                            id: true,
                            avatar: true,
                            bio: true,
                            _count: {
                                select: {
                                    followers: true,
                                    following: true
                                }
                            }
                        }
                    }
                }
            });

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Retornar formato compatível com código antigo (incluindo avatar e bio)
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                username: user.username,
                // Mantém retrocompatibilidade: inclui avatar e bio mesmo que venham do profile
                avatar: user.profile?.avatar || null,
                bio: user.profile?.bio || null,
                // Inclui dados do profile se existir
                profile: user.profile ? {
                    id: user.profile.id,
                    avatar: user.profile.avatar,
                    bio: user.profile.bio,
                    followersCount: user.profile._count.followers,
                    followingCount: user.profile._count.following
                } : null
            };
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao buscar dados do usuário');
        }
    }
}