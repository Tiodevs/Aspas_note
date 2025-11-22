import { Request, Response } from 'express';

const mockGetPhraseById = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        getPhraseById: mockGetPhraseById
      };
    })
  };
});

describe('GetPhraseByIdController', () => {
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

  test('deve retornar 200 quando frase é encontrada', async () => {
    mockReq = {
      params: { id: 'phrase-123' }
    };

    const fraseEncontrada = {
      id: 'phrase-123',
      phrase: 'Frase encontrada',
      author: 'Autor Teste',
      tags: ['teste'],
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockGetPhraseById.mockResolvedValue(fraseEncontrada);

    await phrasesController.getPhraseById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(fraseEncontrada);
    expect(mockGetPhraseById).toHaveBeenCalledWith('phrase-123');
  });

  test('deve retornar 404 quando frase não é encontrada', async () => {
    mockReq = {
      params: { id: 'phrase-not-found' }
    };

    mockGetPhraseById.mockResolvedValue(null);

    await phrasesController.getPhraseById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Frase não encontrada',
      code: 'PHRASE_NOT_FOUND'
    });
  });

  test('deve retornar 500 quando ocorre um erro ao buscar frase', async () => {
    mockReq = {
      params: { id: 'phrase-123' }
    };

    mockGetPhraseById.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.getPhraseById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 