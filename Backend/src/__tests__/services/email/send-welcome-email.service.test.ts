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

import * as nodemailer from 'nodemailer';
const mockSendMail = jest.fn();

describe('SendWelcomeEmailService', () => {
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

  test('deve criar uma instância do EmailService', () => {
    expect(emailService).toBeInstanceOf(EmailService);
  });

  test('deve ter o método enviarEmailBoasVindas', () => {
    expect(typeof emailService.enviarEmailBoasVindas).toBe('function');
  });

  test('deve enviar email de boas-vindas com sucesso', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailBoasVindas('João Silva', 'joao@email.com');

    expect(resultado).toEqual({
      success: true,
      message: 'Email de boas-vindas enviado com sucesso'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'Aspas Note <test@aspasnote.com>',
      to: 'joao@email.com',
      subject: 'Bem-vindo à Aspas Note!',
      html: expect.stringContaining('João Silva')
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendMail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailBoasVindas('João Silva', 'joao@email.com');

    expect(resultado).toEqual({
      success: false,
      message: 'Não foi possível enviar o email de boas-vindas'
    });
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailBoasVindas('José Antônio da Côrte', 'jose@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailBoasVindas('Usuário', 'usuario+teste@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir template HTML correto', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailBoasVindas('Teste', 'teste@email.com');

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Bem-vindo à Aspas Note!');
    expect(callArgs.html).toContain('Teste');
    expect(callArgs.html).toContain('font-family: Arial, sans-serif');
    expect(callArgs.html).toContain('max-width: 600px');
  });

  test('deve configurar o transporter corretamente', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'test@aspasnote.com',
        pass: 'test-password'
      }
    });
  });

  test('deve lidar com nome vazio', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailBoasVindas('', 'teste@email.com');

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com email inválido', async () => {
    mockSendMail.mockRejectedValue(new Error('Invalid email address'));

    const resultado = await emailService.enviarEmailBoasVindas('Teste', 'email-invalido');

    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Não foi possível enviar o email de boas-vindas');
  });
}); 