import { Request, Response } from 'express';

const mockUpdatePhrase = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        updatePhrase: mockUpdatePhrase
      };
    })
  };
});

describe('UpdatePhraseController', () => {
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

  test('deve retornar 200 quando frase é atualizada com sucesso', async () => {
    mockReq = {
      params: { id: 'phrase-123' },
      body: {
        phrase: 'Frase atualizada',
        author: 'Autor Atualizado',
        tags: ['atualizado']
      }
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase atualizada',
      author: 'Autor Atualizado',
      tags: ['atualizado'],
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUpdatePhrase.mockResolvedValue(fraseAtualizada);

    await phrasesController.updatePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(fraseAtualizada);
    expect(mockUpdatePhrase).toHaveBeenCalledWith('phrase-123', {
      phrase: 'Frase atualizada',
      author: 'Autor Atualizado',
      tags: ['atualizado']
    });
  });

  test('deve retornar 404 quando frase não é encontrada para atualização', async () => {
    mockReq = {
      params: { id: 'phrase-not-found' },
      body: {
        phrase: 'Frase atualizada'
      }
    };

    const error = new Error('Record to update not found');
    (error as any).code = 'P2025';

    mockUpdatePhrase.mockRejectedValue(error);

    await phrasesController.updatePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Frase não encontrada',
      code: 'PHRASE_NOT_FOUND'
    });
  });

  test('deve retornar 500 quando ocorre um erro ao atualizar frase', async () => {
    mockReq = {
      params: { id: 'phrase-123' },
      body: {
        phrase: 'Frase atualizada'
      }
    };

    mockUpdatePhrase.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.updatePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 