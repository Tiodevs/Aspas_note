import prisma from '../../prisma/client';

export class ProfileService {
    // Criar perfil
    async createProfile(userId: string, avatar?: string, bio?: string) {
        try {
            // Verificar se o usuário já tem perfil
            const existingProfile = await prisma.profile.findUnique({
                where: { userId }
            });

            if (existingProfile) {
                throw new Error('Perfil já existe para este usuário');
            }

            // Verificar se o usuário existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Criar o perfil
            const profile = await prisma.profile.create({
                data: {
                    userId,
                    avatar: avatar || null,
                    bio: bio || null
                }
            });

            return profile;
        } catch (error) {
            console.error('Erro ao criar perfil:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao criar perfil');
        }
    }

    // Buscar perfil por ID do perfil
    async getProfileById(profileId: string) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { id: profileId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true
                        }
                    }
                }
            });

            if (!profile) {
                throw new Error('Perfil não encontrado');
            }

            return {
                ...profile,
                followersCount: profile._count.followers,
                followingCount: profile._count.following
            };
        } catch (error) {
            console.error('Erro ao buscar perfil por ID:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao buscar perfil');
        }
    }

    // Buscar perfil por ID do usuário
    async getProfileByUserId(userId: string) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true
                        }
                    }
                }
            });

            if (!profile) {
                throw new Error('Perfil não encontrado');
            }

            return {
                ...profile,
                followersCount: profile._count.followers,
                followingCount: profile._count.following
            };
        } catch (error) {
            console.error('Erro ao buscar perfil por userId:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao buscar perfil');
        }
    }

    // Atualizar perfil
    async updateProfile(userId: string, avatar?: string, bio?: string) {
        try {
            // Verificar se o perfil existe
            const existingProfile = await prisma.profile.findUnique({
                where: { userId }
            });

            if (!existingProfile) {
                // Se não existir, criar um novo
                return await this.createProfile(userId, avatar, bio);
            }

            // Atualizar o perfil
            const profile = await prisma.profile.update({
                where: { userId },
                data: {
                    ...(avatar !== undefined && { avatar }),
                    ...(bio !== undefined && { bio })
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            createdAt: true
                        }
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true
                        }
                    }
                }
            });

            return {
                ...profile,
                followersCount: profile._count.followers,
                followingCount: profile._count.following
            };
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao atualizar perfil');
        }
    }

    // Deletar perfil
    async deleteProfile(userId: string) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { userId }
            });

            if (!profile) {
                throw new Error('Perfil não encontrado');
            }

            await prisma.profile.delete({
                where: { userId }
            });

            return { message: 'Perfil deletado com sucesso' };
        } catch (error) {
            console.error('Erro ao deletar perfil:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao deletar perfil');
        }
    }

    // Seguir um perfil
    async followProfile(followerUserId: string, followingUserId: string) {
        try {
            // Não pode seguir a si mesmo
            if (followerUserId === followingUserId) {
                throw new Error('Não é possível seguir a si mesmo');
            }

            // Buscar os perfis
            const followerProfile = await prisma.profile.findUnique({
                where: { userId: followerUserId }
            });

            const followingProfile = await prisma.profile.findUnique({
                where: { userId: followingUserId }
            });

            if (!followerProfile || !followingProfile) {
                throw new Error('Perfil não encontrado');
            }

            // Verificar se já está seguindo
            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: followerProfile.id,
                        followingId: followingProfile.id
                    }
                }
            });

            if (existingFollow) {
                throw new Error('Você já está seguindo este perfil');
            }

            // Criar o relacionamento de seguir
            await prisma.follow.create({
                data: {
                    followerId: followerProfile.id,
                    followingId: followingProfile.id
                }
            });

            return { message: 'Perfil seguido com sucesso' };
        } catch (error) {
            console.error('Erro ao seguir perfil:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao seguir perfil');
        }
    }

    // Deixar de seguir um perfil
    async unfollowProfile(followerUserId: string, followingUserId: string) {
        try {
            // Buscar os perfis
            const followerProfile = await prisma.profile.findUnique({
                where: { userId: followerUserId }
            });

            const followingProfile = await prisma.profile.findUnique({
                where: { userId: followingUserId }
            });

            if (!followerProfile || !followingProfile) {
                throw new Error('Perfil não encontrado');
            }

            // Verificar se está seguindo
            const existingFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: followerProfile.id,
                        followingId: followingProfile.id
                    }
                }
            });

            if (!existingFollow) {
                throw new Error('Você não está seguindo este perfil');
            }

            // Remover o relacionamento
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: followerProfile.id,
                        followingId: followingProfile.id
                    }
                }
            });

            return { message: 'Deixou de seguir o perfil com sucesso' };
        } catch (error) {
            console.error('Erro ao deixar de seguir perfil:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao deixar de seguir perfil');
        }
    }

    // Listar seguidores de um perfil
    async getFollowers(userId: string) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { userId },
                include: {
                    followers: {
                        include: {
                            follower: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            username: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!profile) {
                throw new Error('Perfil não encontrado');
            }

            return profile.followers.map(f => ({
                id: f.follower.id,
                userId: f.follower.userId,
                avatar: f.follower.avatar,
                bio: f.follower.bio,
                user: f.follower.user,
                followedAt: f.createdAt
            }));
        } catch (error) {
            console.error('Erro ao listar seguidores:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao listar seguidores');
        }
    }

    // Listar perfis que um usuário está seguindo
    async getFollowing(userId: string) {
        try {
            const profile = await prisma.profile.findUnique({
                where: { userId },
                include: {
                    following: {
                        include: {
                            following: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            username: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!profile) {
                throw new Error('Perfil não encontrado');
            }

            return profile.following.map(f => ({
                id: f.following.id,
                userId: f.following.userId,
                avatar: f.following.avatar,
                bio: f.following.bio,
                user: f.following.user,
                followedAt: f.createdAt
            }));
        } catch (error) {
            console.error('Erro ao listar seguindo:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao listar seguindo');
        }
    }
}

