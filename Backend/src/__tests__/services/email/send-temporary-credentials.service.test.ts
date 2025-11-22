import { EmailService } from '../../../services/email/email.service';

// Mock do Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

// Mock das configurações de ambiente
jest.mock('../../../config/env', () => ({
  envs: {
    email: {
      sender: 'test@aspasnote.com',
      user: 'test@aspasnote.com',
      password: 'test-password'
    }
  }
}));

// Mock do process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    EMAIL_USER: 'test@aspasnote.com',
    FRONTEND_URL: 'http://localhost:3000'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

import * as nodemailer from 'nodemailer';
const mockSendMail = jest.fn();

describe('SendTemporaryCredentialsService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar o mock do transporter
    mockTransporter = {
      sendMail: mockSendMail
    };
    
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    
    emailService = new EmailService();
  });

  test('deve ter o método enviarEmailCredenciaisTemporarias', () => {
    expect(typeof emailService.enviarEmailCredenciaisTemporarias).toBe('function');
  });

  test('deve enviar email de credenciais temporárias com sucesso', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'João Silva',
      'joao@email.com',
      'senha123'
    );

    expect(resultado).toEqual({
      success: true,
      message: 'Email de credenciais enviado com sucesso'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: '"SumyIA" <test@aspasnote.com>',
      to: 'joao@email.com',
      subject: 'Suas Credenciais de Acesso - SumyIA',
      html: expect.stringContaining('João Silva')
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendMail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'João Silva',
      'joao@email.com',
      'senha123'
    );

    expect(resultado).toEqual({
      success: false,
      message: 'Erro ao enviar email de credenciais'
    });
  });

  test('deve incluir credenciais no template HTML', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha-temporaria-123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('teste@email.com');
    expect(callArgs.html).toContain('senha-temporaria-123');
    expect(callArgs.html).toContain('Bem-vindo(a) à Aspas Note! 🎉');
    expect(callArgs.html).toContain('Senha Temporária');
  });

  test('deve incluir link para login no template', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('http://localhost:3000/login');
    expect(callArgs.html).toContain('Acessar Minha Conta');
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'José Antônio da Côrte',
      'jose@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com senhas complexas', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const senhaComplexa = 'Senha@123#456$789';
    
    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      senhaComplexa
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.html).toContain(senhaComplexa);
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'Usuário',
      'usuario+teste@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir mensagem de segurança no template', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      'senha123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Por questões de segurança');
    expect(callArgs.html).toContain('recomendamos que você altere sua senha');
    expect(callArgs.html).toContain('Se você não solicitou esta conta');
  });

  test('deve lidar com nome vazio', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      '',
      'teste@email.com',
      'senha123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com senha vazia', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailCredenciaisTemporarias(
      'Teste',
      'teste@email.com',
      ''
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Senha Temporária:</strong> ')
      })
    );
  });
}); 