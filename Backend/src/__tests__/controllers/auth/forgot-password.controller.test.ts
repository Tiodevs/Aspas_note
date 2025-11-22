import { Request, Response } from 'express';

const mockForgotPassword = jest.fn();

import { AuthController } from '../../../controllers/auth.controller';

jest.mock('../../../services/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        forgotPassword: mockForgotPassword
      };
    })
  };
});

describe('ForgotPasswordController', () => {
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

  test('deve retornar 200 quando solicitação de recuperação é enviada com sucesso', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com'
      }
    };

    const resultado = {
      message: 'Email de recuperação enviado com sucesso',
      email: 'teste@email.com'
    };

    mockForgotPassword.mockResolvedValue(resultado);

    await authController.forgotPassword(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith(resultado);
    expect(mockForgotPassword).toHaveBeenCalledWith('teste@email.com');
  });

  test('deve retornar 500 quando ocorre erro interno', async () => {
    mockReq = {
      body: {
        email: 'teste@email.com'
      }
    };

    mockForgotPassword.mockRejectedValue(new Error('Erro interno do servidor'));

    await authController.forgotPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });

  test('deve retornar 500 quando email não existe', async () => {
    mockReq = {
      body: {
        email: 'email-inexistente@email.com'
      }
    };

    mockForgotPassword.mockRejectedValue(new Error('Usuário não encontrado'));

    await authController.forgotPassword(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 