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

describe('SendPasswordRecoveryService', () => {
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

  test('deve ter o método enviarEmailRecuperacaoSenha', () => {
    expect(typeof emailService.enviarEmailRecuperacaoSenha).toBe('function');
  });

  test('deve enviar email de recuperação de senha com sucesso', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'João Silva',
      'joao@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado).toEqual({
      success: true,
      message: 'Email de recuperação enviado com sucesso'
    });

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'Aspas Note <test@aspasnote.com>',
      to: 'joao@email.com',
      subject: 'Recuperação de Senha - Aspas Note',
      html: expect.stringContaining('João Silva')
    });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o envio de email retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão SMTP');
    mockSendMail.mockRejectedValue(erroSimulado);

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'João Silva',
      'joao@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado).toEqual({
      success: false,
      message: 'Não foi possível enviar o email de recuperação'
    });
  });

  test('deve incluir link de recuperação no template HTML', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resetLink = 'https://aspasnote.com/reset-password?token=abc123';
    
    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      resetLink
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain(resetLink);
    expect(callArgs.html).toContain('Redefinir Senha');
    expect(callArgs.html).toContain('Recuperação de Senha');
  });

  test('deve incluir informações de segurança no template', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('Se você não solicitou esta alteração');
    expect(callArgs.html).toContain('O link é válido por 1 hora');
    expect(callArgs.html).toContain('Equipe Aspas Note');
  });

  test('deve lidar com nomes com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'José Antônio da Côrte',
      'jose@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('José Antônio da Côrte')
      })
    );
  });

  test('deve lidar com links de recuperação complexos', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const linkComplexo = 'https://aspasnote.com/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU3MTQ5MH0.signature';
    
    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      linkComplexo
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.html).toContain(linkComplexo);
  });

  test('deve lidar com emails com caracteres especiais', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Usuário',
      'usuario+teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'usuario+teste@email.com'
      })
    );
  });

  test('deve incluir botão de ação no template', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('background-color: #4CAF50');
    expect(callArgs.html).toContain('color: white');
    expect(callArgs.html).toContain('border-radius: 5px');
    expect(callArgs.html).toContain('text-decoration: none');
  });

  test('deve lidar com nome vazio', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      '',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('Olá ,')
      })
    );
  });

  test('deve lidar com link de recuperação vazio', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      ''
    );

    expect(resultado.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining('href=""')
      })
    );
  });

  test('deve incluir estrutura HTML correta', async () => {
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'teste@email.com',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    const callArgs = mockSendMail.mock.calls[0][0];
    
    expect(callArgs.html).toContain('font-family: Arial, sans-serif');
    expect(callArgs.html).toContain('max-width: 600px');
    expect(callArgs.html).toContain('margin: 0 auto');
    expect(callArgs.html).toContain('padding: 20px');
  });

  test('deve lidar com email inválido', async () => {
    mockSendMail.mockRejectedValue(new Error('Invalid email address'));

    const resultado = await emailService.enviarEmailRecuperacaoSenha(
      'Teste',
      'email-invalido',
      'https://aspasnote.com/reset-password?token=abc123'
    );

    expect(resultado.success).toBe(false);
    expect(resultado.message).toBe('Não foi possível enviar o email de recuperação');
  });
}); 