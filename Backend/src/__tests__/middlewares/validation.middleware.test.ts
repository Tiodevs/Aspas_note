import { Request, Response } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validation.middleware';
import { createPhraseSchema, updatePhraseSchema, phraseParamsSchema, listPhrasesQuerySchema } from '../../schemas/phrases.schemas';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../../schemas/auth.schemas';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('validate (req.body)', () => {
    describe('createPhraseSchema', () => {
      test('deve passar para o próximo middleware quando dados são válidos', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando phrase está faltando', () => {
        mockReq = {
          body: {
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
            // phrase está faltando
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando userId é inválido', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'user123' // userId inválido (não é CUID)
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'userId',
              message: 'ID do usuário deve ser um CUID válido'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando author está faltando', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
            // author está faltando
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'author',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando phrase é muito curta', () => {
        mockReq = {
          body: {
            phrase: 'Oi', // Muito curta (menos de 5 caracteres)
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter pelo menos 5 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando phrase é muito longa', () => {
        const longPhrase = 'a'.repeat(1001); // Mais de 1000 caracteres
        mockReq = {
          body: {
            phrase: longPhrase,
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter no máximo 1000 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando author é muito curto', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'A', // Muito curto (menos de 2 caracteres)
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'author',
              message: 'Nome do autor deve ter pelo menos 2 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando tags têm mais de 10 elementos', () => {
        const manyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: manyTags,
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'tags',
              message: 'Máximo de 10 tags permitidas'
            }
          ])
        });
      });

      test('deve aceitar tags vazias como array vazio', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            userId: 'c123456789012345678901234'
            // tags não está presente, deve usar default []
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando múltiplos campos são inválidos', () => {
        mockReq = {
          body: {
            phrase: 'Oi', // Muito curta
            author: 'A', // Muito curto
            userId: 'invalid-id' // Inválido
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter pelo menos 5 caracteres'
            },
            {
              field: 'author',
              message: 'Nome do autor deve ter pelo menos 2 caracteres'
            },
            {
              field: 'userId',
              message: 'ID do usuário deve ser um CUID válido'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando phrase é string vazia', () => {
        mockReq = {
          body: {
            phrase: '',
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter pelo menos 5 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando phrase é apenas espaços', () => {
        mockReq = {
          body: {
            phrase: '   ', // Apenas espaços
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter pelo menos 5 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando tags contêm strings vazias', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: ['tag1', '', 'tag3'], // Tag vazia no meio
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'tags.1',
              message: 'Tag não pode estar vazia'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando tags contêm apenas espaços', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: ['tag1', '   ', 'tag3'], // Tag com apenas espaços
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'tags.1',
              message: 'Tag não pode estar vazia'
            }
          ])
        });
      });

      test('deve aceitar phrase com exatamente 5 caracteres', () => {
        mockReq = {
          body: {
            phrase: '12345', // Exatamente 5 caracteres
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar phrase com exatamente 1000 caracteres', () => {
        const exactPhrase = 'a'.repeat(1000); // Exatamente 1000 caracteres
        mockReq = {
          body: {
            phrase: exactPhrase,
            author: 'Autor Teste',
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar author com exatamente 2 caracteres', () => {
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Jo', // Exatamente 2 caracteres
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar author com exatamente 100 caracteres', () => {
        const longAuthor = 'a'.repeat(100); // Exatamente 100 caracteres
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: longAuthor,
            tags: ['teste'],
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar exatamente 10 tags', () => {
        const tenTags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
        mockReq = {
          body: {
            phrase: 'Frase válida com pelo menos 5 caracteres',
            author: 'Autor Teste',
            tags: tenTags,
            userId: 'c123456789012345678901234'
          }
        };

        validate(createPhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('updatePhraseSchema', () => {
      test('deve passar quando apenas phrase é fornecida', () => {
        mockReq = {
          body: {
            phrase: 'Nova frase válida'
          }
        };

        validate(updatePhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve passar quando apenas author é fornecido', () => {
        mockReq = {
          body: {
            author: 'Novo Autor'
          }
        };

        validate(updatePhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando phrase é muito curta', () => {
        mockReq = {
          body: {
            phrase: 'Oi'
          }
        };

        validate(updatePhraseSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'phrase',
              message: 'Frase deve ter pelo menos 5 caracteres'
            }
          ])
        });
      });
    });

    describe('loginSchema', () => {
      test('deve passar quando dados de login são válidos', () => {
        mockReq = {
          body: {
            email: 'teste@exemplo.com',
            senha: 'senha123'
          }
        };

        validate(loginSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando email é inválido', () => {
        mockReq = {
          body: {
            email: 'email-invalido',
            senha: 'senha123'
          }
        };

        validate(loginSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'email',
              message: 'Email inválido'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando senha é muito curta', () => {
        mockReq = {
          body: {
            email: 'teste@exemplo.com',
            senha: '123'
          }
        };

        validate(loginSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'senha',
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          ])
        });
      });
    });

    describe('registerSchema', () => {
      test('deve passar quando dados de registro são válidos', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: 'senha123'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando nome é muito curto', () => {
        mockReq = {
          body: {
            nome: 'J',
            email: 'joao@exemplo.com',
            senha: 'senha123'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'nome',
              message: 'Nome deve ter pelo menos 2 caracteres'
            }
          ])
        });
      });

      test('deve aceitar role opcional', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: 'senha123',
            role: 'PRO'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando email é inválido', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'email-invalido',
            senha: 'senha123'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'email',
              message: 'Email inválido'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando senha é muito curta', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: '123'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'senha',
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando senha é muito longa', () => {
        const longPassword = 'a'.repeat(101); // Mais de 100 caracteres
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: longPassword
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'senha',
              message: 'Senha deve ter no máximo 100 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando nome é muito longo', () => {
        const longName = 'a'.repeat(101); // Mais de 100 caracteres
        mockReq = {
          body: {
            nome: longName,
            email: 'joao@exemplo.com',
            senha: 'senha123'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'nome',
              message: 'Nome deve ter no máximo 100 caracteres'
            }
          ])
        });
      });

      test('deve aceitar role ADMIN', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: 'senha123',
            role: 'ADMIN'
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar role FREE (padrão)', () => {
        mockReq = {
          body: {
            nome: 'João Silva',
            email: 'joao@exemplo.com',
            senha: 'senha123'
            // role não fornecido, deve usar FREE como padrão
          }
        };

        validate(registerSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('forgotPasswordSchema', () => {
      test('deve passar quando email é válido', () => {
        mockReq = {
          body: {
            email: 'teste@exemplo.com'
          }
        };

        validate(forgotPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando email é inválido', () => {
        mockReq = {
          body: {
            email: 'email-invalido'
          }
        };

        validate(forgotPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'email',
              message: 'Email inválido'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando email está faltando', () => {
        mockReq = {
          body: {}
        };

        validate(forgotPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'email',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });

      test('deve aceitar email com maiúsculas e convertê-las para minúsculas', () => {
        mockReq = {
          body: {
            email: 'TESTE@EXEMPLO.COM'
          }
        };

        validate(forgotPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('resetPasswordSchema', () => {
      test('deve passar quando dados são válidos', () => {
        mockReq = {
          body: {
            token: 'token-valido-123',
            novaSenha: 'nova-senha-123'
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando token está faltando', () => {
        mockReq = {
          body: {
            novaSenha: 'nova-senha-123'
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'token',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando novaSenha está faltando', () => {
        mockReq = {
          body: {
            token: 'token-valido-123'
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'novaSenha',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando novaSenha é muito curta', () => {
        mockReq = {
          body: {
            token: 'token-valido-123',
            novaSenha: '123'
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'novaSenha',
              message: 'Nova senha deve ter pelo menos 6 caracteres'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando novaSenha é muito longa', () => {
        const longPassword = 'a'.repeat(101); // Mais de 100 caracteres
        mockReq = {
          body: {
            token: 'token-valido-123',
            novaSenha: longPassword
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'novaSenha',
              message: 'Nova senha deve ter no máximo 100 caracteres'
            }
          ])
        });
      });

      test('deve aceitar novaSenha com exatamente 6 caracteres', () => {
        mockReq = {
          body: {
            token: 'token-valido-123',
            novaSenha: '123456'
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve aceitar novaSenha com exatamente 100 caracteres', () => {
        const exactPassword = 'a'.repeat(100); // Exatamente 100 caracteres
        mockReq = {
          body: {
            token: 'token-valido-123',
            novaSenha: exactPassword
          }
        };

        validate(resetPasswordSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });
  });

  describe('validateParams (req.params)', () => {
    describe('phraseParamsSchema', () => {
      test('deve passar quando ID é válido', () => {
        mockReq = {
          params: {
            id: 'c123456789012345678901234'
          }
        };

        validateParams(phraseParamsSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando ID é inválido', () => {
        mockReq = {
          params: {
            id: 'invalid-id'
          }
        };

        validateParams(phraseParamsSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Parâmetros inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'id',
              message: 'ID deve ser um CUID válido (formato: c + 24 caracteres alfanuméricos)'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando ID está faltando', () => {
        mockReq = {
          params: {}
        };

        validateParams(phraseParamsSchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Parâmetros inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'id',
              message: 'Invalid input: expected string, received undefined'
            }
          ])
        });
      });
    });
  });

  describe('validateQuery (req.query)', () => {
    describe('listPhrasesQuerySchema', () => {
      test('deve passar quando query parameters são válidos', () => {
        mockReq = {
          query: {
            userId: 'c123456789012345678901234',
            tag: 'inspiracao',
            author: 'Machado de Assis',
            search: 'vida',
            page: '1',
            limit: '10'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve usar valores padrão quando page e limit não são fornecidos', () => {
        mockReq = {
          query: {
            userId: 'c123456789012345678901234'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      test('deve retornar erro 400 quando page não é um número', () => {
        mockReq = {
          query: {
            page: 'abc'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Query parameters inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'page',
              message: 'Página deve ser um número'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando page é zero', () => {
        mockReq = {
          query: {
            page: '0'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Query parameters inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'page',
              message: 'Página deve ser maior que 0'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando limit é muito alto', () => {
        mockReq = {
          query: {
            limit: '150'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Query parameters inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'limit',
              message: 'Limite deve ser entre 1 e 100'
            }
          ])
        });
      });

      test('deve retornar erro 400 quando limit não é um número', () => {
        mockReq = {
          query: {
            limit: 'abc'
          }
        };

        validateQuery(listPhrasesQuerySchema)(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Query parameters inválidos',
          code: 'VALIDATION_ERROR',
          details: expect.arrayContaining([
            {
              field: 'limit',
              message: 'Limite deve ser um número'
            }
          ])
        });
      });
    });
  });

  describe('Erros inesperados', () => {
    test('deve retornar erro 500 quando ocorre erro inesperado no validate', () => {
      // Mock de um schema que vai causar erro inesperado
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Erro inesperado');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando ocorre erro inesperado no validateParams', () => {
      // Mock de um schema que vai causar erro inesperado
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Erro inesperado');
        })
      };

      mockReq = {
        params: {
          id: 'c123456789012345678901234'
        }
      };

      validateParams(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando ocorre erro inesperado no validateQuery', () => {
      // Mock de um schema que vai causar erro inesperado
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error('Erro inesperado');
        })
      };

      mockReq = {
        query: {
          page: '1'
        }
      };

      validateQuery(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança TypeError', () => {
      // Mock de um schema que vai causar TypeError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new TypeError('Tipo inválido');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança ReferenceError', () => {
      // Mock de um schema que vai causar ReferenceError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new ReferenceError('Referência indefinida');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança SyntaxError', () => {
      // Mock de um schema que vai causar SyntaxError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new SyntaxError('Erro de sintaxe');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança RangeError', () => {
      // Mock de um schema que vai causar RangeError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new RangeError('Valor fora do intervalo');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança URIError', () => {
      // Mock de um schema que vai causar URIError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new URIError('URI inválida');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança EvalError', () => {
      // Mock de um schema que vai causar EvalError
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new EvalError('Erro de avaliação');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança erro customizado', () => {
      // Mock de um schema que vai causar erro customizado
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new CustomError('Erro customizado');
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });

    test('deve retornar erro 500 quando schema.parse lança erro sem mensagem', () => {
      // Mock de um schema que vai causar erro sem mensagem
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error();
        })
      };

      mockReq = {
        body: {
          phrase: 'Frase válida'
        }
      };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  });
}); 