import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { validate, validateParams } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { createProfileSchema, updateProfileSchema, profileIdParamsSchema, profileUserIdParamsSchema, followProfileSchema } from '../schemas/profile.schemas';

const router = Router();
const profileController = new ProfileController();

// Rotas protegidas (requerem autenticação)
// Criar perfil
router.post('/', authenticateToken, validate(createProfileSchema), profileController.create);

// Buscar perfil do usuário atual
router.get('/me', authenticateToken, profileController.getMyProfile);

// Atualizar perfil do usuário atual
router.put('/me', authenticateToken, validate(updateProfileSchema), profileController.update);

// Deletar perfil do usuário atual
router.delete('/me', authenticateToken, profileController.delete);

// Seguir um perfil
router.post('/follow', authenticateToken, validate(followProfileSchema), profileController.follow);

// Deixar de seguir um perfil
router.post('/unfollow', authenticateToken, validate(followProfileSchema), profileController.unfollow);

// Rotas públicas (podem ser acessadas sem autenticação para visualização)
// IMPORTANTE: Rotas mais específicas devem vir antes das genéricas
// Listar seguidores de um perfil
router.get('/user/:userId/followers', validateParams(profileUserIdParamsSchema), profileController.getFollowers);

// Listar perfis que um usuário está seguindo
router.get('/user/:userId/following', validateParams(profileUserIdParamsSchema), profileController.getFollowing);

// Buscar perfil por ID do usuário
router.get('/user/:userId', validateParams(profileUserIdParamsSchema), profileController.getByUserId);

// Buscar perfil por ID do perfil (deve vir por último)
router.get('/:id', validateParams(profileIdParamsSchema), profileController.getById);

export default router;

