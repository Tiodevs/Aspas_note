import { Request, Response } from 'express';

const mockLogin = jest.fn();

import { AuthController } from '../../../controllers/auth.controller';

jest.mock('../../../services/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        login: mockLogin
      };
    })
  };
});

describe('LoginController', () => {
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

  test('deve retornar 200 quando login é realizado com sucesso', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com',
        senha: 'senha123'
      }
    };

    const resultadoLogin = {
      token: 'jwt-token-exemplo',
      user: {
        id: 'user-123',
        nome: 'Usuário Teste',
        email: 'teste@email.com',
        role: 'USER'
      }
    };

    mockLogin.mockResolvedValue(resultadoLogin);

    await authController.login(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith(resultadoLogin);
    expect(mockLogin).toHaveBeenCalledWith('teste@email.com', 'senha123');
  });

  test('deve retornar 401 quando credenciais são inválidas', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com',
        senha: 'senha-incorreta'
      }
    };

    mockLogin.mockRejectedValue(new Error('Email ou senha incorretos'));

    await authController.login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Email ou senha incorretos',
      code: 'INVALID_CREDENTIALS'
    });
  });

  test('deve retornar 500 quando há erro ao gerar token', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com',
        senha: 'senha123'
      }
    };

    mockLogin.mockRejectedValue(new Error('Erro ao gerar token'));

    await authController.login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro ao gerar token',
      code: 'TOKEN_GENERATION_ERROR'
    });
  });

  test('deve retornar 500 quando ocorre erro interno', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com',
        senha: 'senha123'
      }
    };

    mockLogin.mockRejectedValue(new Error('Erro interno do servidor'));

    await authController.login(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 