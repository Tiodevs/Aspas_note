import { AuthService } from '../../../services/auth/auth.service';
import { EmailService } from '../../../services/email/email.service';
import { Role } from '../../../schemas/auth.schemas';

// Mock das dependências
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../services/email/email.service');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('crypto');

import mockPrisma from '../../../prisma/client';
import { EmailService as MockEmailService } from '../../../services/email/email.service';
import jwt from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import crypto from 'crypto';

const mockUserFindUnique = (mockPrisma as any).user.findUnique;
const mockUserFindFirst = (mockPrisma as any).user.findFirst;
const mockUserCreate = (mockPrisma as any).user.create;
const mockUserUpdate = (mockPrisma as any).user.update;
const mockPasswordResetCreate = (mockPrisma as any).passwordReset.create;
const mockPasswordResetFindFirst = (mockPrisma as any).passwordReset.findFirst;
const mockPasswordResetUpdate = (mockPrisma as any).passwordReset.update;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockBcrypt = { compare, hash } as jest.Mocked<typeof import('bcryptjs')>;
const mockCrypto = crypto as jest.Mocked<typeof crypto>;
const mockEmailService = MockEmailService as jest.MockedClass<typeof EmailService>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockEmailServiceInstance: jest.Mocked<EmailService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock da instância do EmailService
    mockEmailServiceInstance = {
      enviarEmailBoasVindas: jest.fn(),
      enviarEmailRecuperacaoSenha: jest.fn(),
      enviarCredenciaisTemporarias: jest.fn()
    } as any;
    
    mockEmailService.mockImplementation(() => mockEmailServiceInstance);
    
    authService = new AuthService();
  });

  describe('login', () => {
    const mockUser = {
      id: 'c123456789012345678901234',
      email: 'teste@exemplo.com',
      password: 'hashedPassword123',
      name: 'João Silva',
      role: Role.FREE,
      username: 'joao123',
      avatar: 'avatar.jpg',
      bio: 'Bio do usuário',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'joao123'
    };

    const mockToken = 'mock.jwt.token';

    beforeEach(() => {
      (mockJwt.sign as jest.Mock).mockReturnValue(mockToken);
    });

    test('deve fazer login com sucesso quando credenciais são válidas', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(email, senha);

      // Assert
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(senha, mockUser.password);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        process.env.JWT_SECRET || 'seu_segredo_super_secreto',
        { expiresIn: '10d' }
      );
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          nome: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    });

    test('deve usar fallback do JWT_SECRET quando variável de ambiente não está definida', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';
      const originalJwtSecret = process.env.JWT_SECRET;

      // Remove a variável de ambiente temporariamente
      delete process.env.JWT_SECRET;

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await authService.login(email, senha);

      // Assert
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        'seu_segredo_super_secreto',
        { expiresIn: '10d' }
      );

      // Restaura a variável de ambiente
      if (originalJwtSecret) {
        process.env.JWT_SECRET = originalJwtSecret;
      }
    });

    test('deve lançar erro quando usuário não existe', async () => {
      // Arrange
      const email = 'inexistente@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Email ou senha incorretos');
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    test('deve lançar erro quando senha está incorreta', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha_incorreta';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Email ou senha incorretos');
      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(senha, mockUser.password);
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    test('deve lançar erro quando JWT sign falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('');

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Erro ao gerar token');
    });

    test('deve lançar erro quando JWT sign retorna null', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue(null);

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Erro ao gerar token');
    });

    test('deve lançar erro quando prisma.findUnique falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockRejectedValue(new Error('Erro de banco de dados'));

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Erro de banco de dados');
    });

    test('deve lançar erro quando bcrypt.compare falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockRejectedValue(new Error('Erro de comparação'));

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Erro de comparação');
    });

    test('deve lançar erro quando ocorre erro não-Error no login', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const senha = 'senha123';

      mockUserFindUnique.mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockRejectedValue('String error');

      // Act & Assert
      await expect(authService.login(email, senha)).rejects.toThrow('Erro no processo de login');
    });
  });

  describe('createUser', () => {
    const mockNewUser = {
      id: 'c123456789012345678901234',
      username: 'joao123',
      email: 'joao@exemplo.com',
      password: 'hashedPassword123',
      role: Role.FREE,
      name: null,
      avatar: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: null
    };

    const mockUpdatedUser = {
      ...mockNewUser,
      updatedBy: 'joao@exemplo.com'
    };

    beforeEach(() => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
    });

    test('deve criar usuário com sucesso', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(mockNewUser);
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);
      mockEmailServiceInstance.enviarEmailBoasVindas.mockResolvedValue({
        success: true,
        message: 'Email enviado com sucesso'
      });

      // Act
      const result = await authService.createUser(username, email, password, role);

      // Assert
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 8);
      expect(mockUserCreate).toHaveBeenCalledWith({
        data: {
          username,
          email,
          password: 'hashedPassword123',
          role
        }
      });
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: mockNewUser.id },
        data: {
          updatedBy: mockNewUser.email
        }
      });
      expect(mockEmailServiceInstance.enviarEmailBoasVindas).toHaveBeenCalledWith(username, email);
      expect(result).toEqual({
        id: mockUpdatedUser.id,
        username: mockUpdatedUser.username,
        email: mockUpdatedUser.email,
        role: mockUpdatedUser.role,
        name: mockUpdatedUser.name,
        avatar: mockUpdatedUser.avatar,
        bio: mockUpdatedUser.bio,
        createdAt: mockUpdatedUser.createdAt,
        updatedAt: mockUpdatedUser.updatedAt,
        updatedBy: mockUpdatedUser.updatedBy
      });
    });

    test('deve lançar erro quando email já está em uso', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      const existingUser = {
        ...mockNewUser,
        email: 'joao@exemplo.com',
        username: 'outro_usuario'
      };

      mockUserFindFirst.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Este email já está em uso.');
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    test('deve lançar erro quando username já está em uso', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      const existingUser = {
        ...mockNewUser,
        email: 'outro@exemplo.com',
        username: 'joao123'
      };

      mockUserFindFirst.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Este nome de usuário já está em uso.');
      expect(mockUserFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    test('deve criar usuário mesmo quando email de boas-vindas falha', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(mockNewUser);
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);
      mockEmailServiceInstance.enviarEmailBoasVindas.mockResolvedValue({
        success: false,
        message: 'Falha ao enviar email'
      });

      // Act
      const result = await authService.createUser(username, email, password, role);

      // Assert
      expect(result).toBeDefined();
      expect(mockEmailServiceInstance.enviarEmailBoasVindas).toHaveBeenCalledWith(username, email);
    });

    test('deve criar usuário mesmo quando email de boas-vindas lança erro', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(mockNewUser);
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);
      mockEmailServiceInstance.enviarEmailBoasVindas.mockRejectedValue(new Error('Erro de email'));

      // Act
      const result = await authService.createUser(username, email, password, role);

      // Assert
      expect(result).toBeDefined();
      expect(mockEmailServiceInstance.enviarEmailBoasVindas).toHaveBeenCalledWith(username, email);
    });

    test('deve criar usuário e logar warning quando email de boas-vindas falha', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue(mockNewUser);
      mockUserUpdate.mockResolvedValue(mockUpdatedUser);
      mockEmailServiceInstance.enviarEmailBoasVindas.mockResolvedValue({
        success: false,
        message: 'Falha ao enviar email'
      });

      // Act
      const result = await authService.createUser(username, email, password, role);

      // Assert
      expect(result).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        `Falha ao enviar email de boas-vindas para ${email}: Falha ao enviar email`
      );

      consoleSpy.mockRestore();
    });

    test('deve lançar erro quando prisma.findFirst falha', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockRejectedValue(new Error('Erro de banco de dados'));

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Erro de banco de dados');
    });

    test('deve lançar erro quando bcrypt.hash falha', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(new Error('Erro de hash'));

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Erro de hash');
    });

    test('deve lançar erro quando prisma.create falha', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockRejectedValue(new Error('Erro de criação'));

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Erro de criação');
    });

    test('deve lançar erro quando ocorre erro não-Error no createUser', async () => {
      // Arrange
      const username = 'joao123';
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const role = Role.FREE;

      mockUserFindFirst.mockResolvedValue(null);
      mockUserCreate.mockRejectedValue('String error');

      // Act & Assert
      await expect(authService.createUser(username, email, password, role)).rejects.toThrow('Erro ao criar usuário');
    });
  });

  describe('forgotPassword', () => {
    const mockUser = {
      id: 'c123456789012345678901234',
      email: 'teste@exemplo.com',
      name: 'João Silva',
      role: Role.FREE,
      username: 'joao123',
      avatar: 'avatar.jpg',
      bio: 'Bio do usuário',
      password: 'hashedPassword123',
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'joao123'
    };

    const mockToken = 'mock-reset-token';
    const mockUUID = 'mock-uuid';

    beforeEach(() => {
      (mockCrypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from(mockToken));
      (mockCrypto.randomUUID as jest.Mock).mockReturnValue(mockUUID);
    });

    test('deve processar recuperação de senha com sucesso', async () => {
      // Arrange
      const email = 'teste@exemplo.com';
      const expectedExpiresAt = new Date(Date.now() + 3600000);
      const hexToken = Buffer.from(mockToken).toString('hex');

      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPasswordResetCreate.mockResolvedValue({
        id: mockUUID,
        email: mockUser.email,
        token: hexToken,
        expiresAt: expectedExpiresAt,
        used: false,
        createdAt: new Date()
      });
      mockEmailServiceInstance.enviarEmailRecuperacaoSenha.mockResolvedValue({
        success: true,
        message: 'Email enviado com sucesso'
      });

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockCrypto.randomUUID).toHaveBeenCalled();
      expect(mockPasswordResetCreate).toHaveBeenCalledWith({
        data: {
          id: mockUUID,
          email: mockUser.email,
          token: hexToken,
          expiresAt: expect.any(Date),
          used: false,
          createdAt: expect.any(Date)
        }
      });
      expect(mockEmailServiceInstance.enviarEmailRecuperacaoSenha).toHaveBeenCalledWith(
        mockUser.name || '',
        email,
        `${process.env.SERVER_HOST || 'http://localhost:3000'}/reset-password?token=${hexToken}`
      );
      expect(result).toEqual({
        message: 'Instruções de recuperação enviadas para seu email.'
      });
    });

    test('deve retornar mensagem quando usuário não existe', async () => {
      // Arrange
      const email = 'inexistente@exemplo.com';

      mockUserFindUnique.mockResolvedValue(null);

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { email } });
      expect(mockCrypto.randomBytes).not.toHaveBeenCalled();
      expect(mockPasswordResetCreate).not.toHaveBeenCalled();
      expect(mockEmailServiceInstance.enviarEmailRecuperacaoSenha).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Se esse email estiver cadastrado, você receberá instruções.'
      });
    });

    test('deve processar mesmo quando email de recuperação falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';

      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPasswordResetCreate.mockResolvedValue({
        id: mockUUID,
        email: mockUser.email,
        token: mockToken,
        expiresAt: new Date(),
        used: false,
        createdAt: new Date()
      });
      mockEmailServiceInstance.enviarEmailRecuperacaoSenha.mockResolvedValue({
        success: false,
        message: 'Falha ao enviar email'
      });

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(result).toEqual({
        message: 'Instruções de recuperação enviadas para seu email.'
      });
      expect(mockEmailServiceInstance.enviarEmailRecuperacaoSenha).toHaveBeenCalled();
    });

    

    test('deve lançar erro quando prisma.findUnique falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';

      mockUserFindUnique.mockRejectedValue(new Error('Erro de banco de dados'));

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow('Erro de banco de dados');
    });

    test('deve lançar erro quando prisma.passwordReset.create falha', async () => {
      // Arrange
      const email = 'teste@exemplo.com';

      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPasswordResetCreate.mockRejectedValue(new Error('Erro de criação'));

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow('Erro de criação');
    });

    test('deve lançar erro quando ocorre erro não-Error no forgotPassword', async () => {
      // Arrange
      const email = 'teste@exemplo.com';

      mockUserFindUnique.mockResolvedValue(mockUser);
      mockPasswordResetCreate.mockRejectedValue('String error');

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow('Erro ao processar solicitação de recuperação');
    });
  });

  describe('resetPassword', () => {
    const mockPasswordReset = {
      id: 'c123456789012345678901234',
      email: 'teste@exemplo.com',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hora no futuro
      used: false,
      createdAt: new Date()
    };

    beforeEach(() => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword123');
    });

    test('deve redefinir senha com sucesso', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(mockPasswordReset);
      mockUserUpdate.mockResolvedValue({
        id: 'c123456789012345678901234',
        email: 'teste@exemplo.com',
        password: 'newHashedPassword123',
        updatedBy: 'teste@exemplo.com'
      } as any);
      mockPasswordResetUpdate.mockResolvedValue({
        ...mockPasswordReset,
        used: true
      });

      // Act
      const result = await authService.resetPassword(token, novaSenha);

      // Assert
      expect(mockPasswordResetFindFirst).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: expect.any(Date)
          }
        }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(novaSenha, 8);
      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { email: mockPasswordReset.email },
        data: {
          password: 'newHashedPassword123',
          updatedBy: mockPasswordReset.email
        }
      });
      expect(mockPasswordResetUpdate).toHaveBeenCalledWith({
        where: { id: mockPasswordReset.id },
        data: { used: true }
      });
      expect(result).toEqual({
        message: 'Senha atualizada com sucesso'
      });
    });

    test('deve lançar erro quando token não existe', async () => {
      // Arrange
      const token = 'invalid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Token inválido ou expirado');
      expect(mockPasswordResetFindFirst).toHaveBeenCalledWith({
        where: {
          token,
          used: false,
          expiresAt: {
            gt: expect.any(Date)
          }
        }
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserUpdate).not.toHaveBeenCalled();
      expect(mockPasswordResetUpdate).not.toHaveBeenCalled();
    });

    test('deve lançar erro quando bcrypt.hash falha', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(mockPasswordReset);
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(new Error('Erro de hash'));

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Erro de hash');
    });

    test('deve lançar erro quando prisma.user.update falha', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(mockPasswordReset);
      mockUserUpdate.mockRejectedValue(new Error('Erro de atualização'));

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Erro de atualização');
    });

    test('deve lançar erro quando prisma.passwordReset.update falha', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(mockPasswordReset);
      mockUserUpdate.mockResolvedValue({} as any);
      mockPasswordResetUpdate.mockRejectedValue(new Error('Erro de atualização'));

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Erro de atualização');
    });

    test('deve lançar erro quando prisma.passwordReset.findFirst falha', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockRejectedValue(new Error('Erro de banco de dados'));

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Erro de banco de dados');
    });

    test('deve lançar erro quando ocorre erro não-Error no resetPassword', async () => {
      // Arrange
      const token = 'valid-token';
      const novaSenha = 'novaSenha123';

      mockPasswordResetFindFirst.mockResolvedValue(mockPasswordReset);
      mockUserUpdate.mockRejectedValue('String error');

      // Act & Assert
      await expect(authService.resetPassword(token, novaSenha)).rejects.toThrow('Erro ao redefinir senha');
    });
  });
}); 