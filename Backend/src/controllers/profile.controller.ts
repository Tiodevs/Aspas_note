import { Request, Response } from 'express';
import { ProfileService } from '../services/profile/profile.service';
import { CreateProfileInput, UpdateProfileInput, FollowProfileInput } from '../schemas/profile.schemas';

const profileService = new ProfileService();

export class ProfileController {
    // Criar perfil
    create = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const { avatar, bio }: CreateProfileInput = req.body;

            const profile = await profileService.createProfile(userId, avatar, bio);

            res.status(201).json({
                message: 'Perfil criado com sucesso',
                profile
            });
        } catch (error: any) {
            console.error('Erro ao criar perfil:', error);
            
            if (error.message === 'Perfil já existe para este usuário') {
                res.status(409).json({
                    error: 'Perfil já existe para este usuário',
                    code: 'PROFILE_ALREADY_EXISTS'
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

            res.status(500).json({
                error: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Buscar perfil por ID do perfil
    getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const profile = await profileService.getProfileById(id);

            res.json(profile);
        } catch (error: any) {
            console.error('Erro ao buscar perfil:', error);
            
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

    // Buscar perfil por ID do usuário
    getByUserId = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            const profile = await profileService.getProfileByUserId(userId);

            res.json(profile);
        } catch (error: any) {
            console.error('Erro ao buscar perfil:', error);
            
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

    // Buscar perfil do usuário atual
    getMyProfile = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const profile = await profileService.getProfileByUserId(userId);

            res.json(profile);
        } catch (error: any) {
            console.error('Erro ao buscar perfil:', error);
            
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

    // Atualizar perfil
    update = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const { avatar, bio }: UpdateProfileInput = req.body;

            const profile = await profileService.updateProfile(userId, avatar, bio);

            res.json({
                message: 'Perfil atualizado com sucesso',
                profile
            });
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            
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

    // Deletar perfil
    delete = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;
            
            if (!userId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const result = await profileService.deleteProfile(userId);

            res.json(result);
        } catch (error: any) {
            console.error('Erro ao deletar perfil:', error);
            
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

    // Seguir um perfil
    follow = async (req: Request, res: Response) => {
        try {
            const followerUserId = (req as any).user?.userId;
            
            if (!followerUserId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const { followingUserId }: FollowProfileInput = req.body;

            const result = await profileService.followProfile(followerUserId, followingUserId);

            res.json(result);
        } catch (error: any) {
            console.error('Erro ao seguir perfil:', error);
            
            if (error.message === 'Não é possível seguir a si mesmo') {
                res.status(400).json({
                    error: 'Não é possível seguir a si mesmo',
                    code: 'CANNOT_FOLLOW_SELF'
                });
                return;
            }

            if (error.message === 'Você já está seguindo este perfil') {
                res.status(409).json({
                    error: 'Você já está seguindo este perfil',
                    code: 'ALREADY_FOLLOWING'
                });
                return;
            }

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

    // Deixar de seguir um perfil
    unfollow = async (req: Request, res: Response) => {
        try {
            const followerUserId = (req as any).user?.userId;
            
            if (!followerUserId) {
                res.status(401).json({
                    error: 'Token inválido ou expirado',
                    code: 'INVALID_TOKEN'
                });
                return;
            }

            const { followingUserId }: FollowProfileInput = req.body;

            const result = await profileService.unfollowProfile(followerUserId, followingUserId);

            res.json(result);
        } catch (error: any) {
            console.error('Erro ao deixar de seguir perfil:', error);
            
            if (error.message === 'Você não está seguindo este perfil') {
                res.status(400).json({
                    error: 'Você não está seguindo este perfil',
                    code: 'NOT_FOLLOWING'
                });
                return;
            }

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

    // Listar seguidores
    getFollowers = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            const followers = await profileService.getFollowers(userId);

            res.json(followers);
        } catch (error: any) {
            console.error('Erro ao listar seguidores:', error);
            
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

    // Listar perfis que está seguindo
    getFollowing = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;

            const following = await profileService.getFollowing(userId);

            res.json(following);
        } catch (error: any) {
            console.error('Erro ao listar seguindo:', error);
            
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
}

