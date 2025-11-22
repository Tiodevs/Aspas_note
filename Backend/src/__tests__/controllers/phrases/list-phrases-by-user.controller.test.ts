import { Request, Response } from 'express';

const mockListPhrasesByUser = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        listPhrasesByUser: mockListPhrasesByUser
      };
    })
  };
});

describe('ListPhrasesByUserController', () => {
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

  test('deve retornar 200 quando frases do usuário são encontradas', async () => {
    mockReq = {
      params: { userId: 'user123' }
    };

    const frasesDoUsuario = [
      {
        id: 'phrase-1',
        phrase: 'Frase do usuário 1',
        author: 'Autor 1',
        tags: ['tag1'],
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'phrase-2',
        phrase: 'Frase do usuário 2',
        author: 'Autor 2',
        tags: ['tag2'],
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockListPhrasesByUser.mockResolvedValue(frasesDoUsuario);

    await phrasesController.listPhrasesByUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(frasesDoUsuario);
    expect(mockListPhrasesByUser).toHaveBeenCalledWith('user123');
  });

  test('deve retornar 200 quando usuário não tem frases (array vazio)', async () => {
    mockReq = {
      params: { userId: 'user-sem-frases' }
    };

    const frasesVazias: any[] = [];

    mockListPhrasesByUser.mockResolvedValue(frasesVazias);

    await phrasesController.listPhrasesByUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(frasesVazias);
  });

  test('deve retornar 500 quando ocorre um erro ao buscar frases do usuário', async () => {
    mockReq = {
      params: { userId: 'user123' }
    };

    mockListPhrasesByUser.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.listPhrasesByUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 