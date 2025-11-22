import { Request, Response } from 'express';

const mockListPhrase = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        listPhrase: mockListPhrase
      };
    })
  };
});

describe('ListPhrasesController', () => {
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

  test('deve retornar 200 quando todas as frases são retornadas com sucesso', async () => {
    mockReq = {};

    const frasesRetornadas = [
      {
        "id": "cmdqn6iap000390w9f8jwyeou",
        "phrase": "Todos os dias quando acrodo",
        "author": "Felipe",
        "tags": ["Música"],
        "createdAt": "2025-07-31T00:13:55.874Z",
        "updatedAt": "2025-07-31T00:13:55.874Z",
        "userId": "cmdp00uq50000139mwyhjzgor"
      },
      {
        "id": "cmdqn6dhe000190w9dz4uq14a",
        "phrase": "Todos os dias quando acrodo",
        "author": "Felipe",
        "tags": ["Música"],
        "createdAt": "2025-07-31T00:13:48.094Z",
        "updatedAt": "2025-07-31T00:13:48.094Z",
        "userId": "cmdp00uq50000139mwyhjzgor"
      }
    ];

    mockListPhrase.mockResolvedValue(frasesRetornadas);

    await phrasesController.listPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(frasesRetornadas);
  });

  test('deve retornar 404 quando não há frases para retornar', async () => {
    mockReq = {};

    const frasesRetornadas: any[] = [];

    mockListPhrase.mockResolvedValue(frasesRetornadas);

    await phrasesController.listPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Nenhuma frase encontrada',
      code: 'PHRASE_NOT_FOUND'
    });
  });

  test('deve retornar 500 quando ocorre um erro ao buscar frases', async () => {
    mockReq = {};

    mockListPhrase.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.listPhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 