import { Request, Response } from 'express';

const mockCreatePhrase = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        createPhrase: mockCreatePhrase
      };
    })
  };
});

describe('CreatePhraseController', () => {
  let phrasesController: PhrasesController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    phrasesController = new PhrasesController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  test('deve retornar 201 quando frase é criada com sucesso', async () => {
    mockReq = {
      body: {
        phrase: 'Teste de frase',
        author: 'Autor Teste',
        tags: ['teste'],
        userId: 'user123'
      }
    };

    const fraseRetornada = {
      id: 'phrase-created',
      phrase: 'Teste de frase',
      author: 'Autor Teste',
      tags: ['teste'],
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreatePhrase.mockResolvedValue(fraseRetornada);

    await phrasesController.createPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(fraseRetornada);
    expect(mockCreatePhrase).toHaveBeenCalledWith(
      'Teste de frase',
      'Autor Teste',
      ['teste'],
      'user123'
    );
  });

  test('deve funcionar sem tags (undefined)', async () => {
    mockReq = {
      body: {
        phrase: 'Frase sem tags',
        author: 'Autor',
        userId: 'user123'
      }
    };

    const fraseRetornada = {
      id: 'phrase-no-tags',
      phrase: 'Frase sem tags',
      author: 'Autor',
      tags: undefined,
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreatePhrase.mockResolvedValue(fraseRetornada);

    await phrasesController.createPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(201);
  });

  test('deve retornar erro 500 quando service falha', async () => {
    mockReq = {
      body: {
        phrase: 'Frase válida',
        author: 'Autor',
        tags: ['teste'],
        userId: 'user123'
      }
    };

    mockCreatePhrase.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.createPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 