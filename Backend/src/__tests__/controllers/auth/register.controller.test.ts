import { Request, Response } from 'express';

const mockCreateUser = jest.fn();

import { AuthController } from '../../../controllers/auth.controller';

jest.mock('../../../services/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        createUser: mockCreateUser
      };
    })
  };
});

describe('RegisterController', () => {
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    authController = new AuthController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  test('deve retornar 201 quando usuário é criado com sucesso', async () => {
    mockReq = {
      body: {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        senha: 'senha123',
        role: 'USER'
      }
    };

    const usuarioCriado = {
      id: 'user-123',
      nome: 'Usuário Teste',
      email: 'teste@email.com',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreateUser.mockResolvedValue(usuarioCriado);

    await authController.register(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Usuário criado com sucesso',
      user: usuarioCriado
    });
    expect(mockCreateUser).toHaveBeenCalledWith('Usuário Teste', 'teste@email.com', 'senha123', 'USER');
  });

  test('deve retornar 409 quando email já está em uso', async () => {
    mockReq = {
      body: {
        nome: 'Usuário Teste',
        email: 'email-existente@email.com',
        senha: 'senha123',
        role: 'USER'
      }
    };

    mockCreateUser.mockRejectedValue(new Error('Este email já está em uso.'));

    await authController.register(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Este email já está em uso',
      code: 'EMAIL_ALREADY_EXISTS'
    });
  });

  test('deve retornar 409 quando nome de usuário já está em uso', async () => {
    mockReq = {
      body: {
        nome: 'Nome Existente',
        email: 'teste@email.com',
        senha: 'senha123',
        role: 'USER'
      }
    };

    mockCreateUser.mockRejectedValue(new Error('Este nome de usuário já está em uso.'));

    await authController.register(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(409);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Este nome de usuário já está em uso',
      code: 'USERNAME_ALREADY_EXISTS'
    });
  });

  test('deve retornar 500 quando ocorre erro interno', async () => {
    mockReq = {
      body: {
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        senha: 'senha123',
        role: 'USER'
      }
    };

    mockCreateUser.mockRejectedValue(new Error('Erro interno do servidor'));

    await authController.register(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 