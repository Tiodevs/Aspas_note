import { Request, Response } from 'express';

const mockDeletePhrase = jest.fn();

import { PhrasesController } from '../../../controllers/phrases.controller';

jest.mock('../../../services/phrases/phrases.service', () => {
  return {
    PhrasesService: jest.fn().mockImplementation(() => {
      return {
        deletePhrase: mockDeletePhrase
      };
    })
  };
});

describe('DeletePhraseController', () => {
  let phrasesController: PhrasesController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    phrasesController = new PhrasesController();

    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });

    mockRes = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    };
  });

  test('deve retornar 204 quando frase é deletada com sucesso', async () => {
    mockReq = {
      params: { id: 'phrase-123' }
    };

    mockDeletePhrase.mockResolvedValue(undefined);

    await phrasesController.deletePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(204);
    expect(mockSend).toHaveBeenCalledWith();
    expect(mockDeletePhrase).toHaveBeenCalledWith('phrase-123');
  });

  test('deve retornar 404 quando frase não é encontrada para deletar', async () => {
    mockReq = {
      params: { id: 'phrase-not-found' }
    };

    const error = new Error('Record to delete not found');
    (error as any).code = 'P2025';

    mockDeletePhrase.mockRejectedValue(error);

    await phrasesController.deletePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Frase não encontrada',
      code: 'PHRASE_NOT_FOUND'
    });
  });

  test('deve retornar 500 quando ocorre um erro ao deletar frase', async () => {
    mockReq = {
      params: { id: 'phrase-123' }
    };

    mockDeletePhrase.mockRejectedValue(new Error('Erro no banco de dados'));

    await phrasesController.deletePhrase(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  });
}); 