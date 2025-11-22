import { PhrasesService } from '../../../services/phrases/phrases.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    phrase: {
      delete: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';
const mockDelete = (mockPrisma as any).phrase.delete;

describe('DeletePhraseService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve ter o método deletePhrase', () => {
    expect(typeof phrasesService.deletePhrase).toBe('function');
  });

  test('deve deletar uma frase com sucesso', async () => {
    mockDelete.mockResolvedValue(undefined);

    await phrasesService.deletePhrase('phrase-123');

    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'phrase-123' }
    });
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockDelete.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.deletePhrase('phrase-123')
    ).rejects.toThrow('Erro de conexão com banco');
  });

  test('deve falhar quando frase não existe', async () => {
    const erroSimulado = new Error('Record to delete not found');
    mockDelete.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.deletePhrase('phrase-inexistente')
    ).rejects.toThrow('Record to delete not found');
  });

  test('deve deletar frase com ID complexo', async () => {
    mockDelete.mockResolvedValue(undefined);

    await phrasesService.deletePhrase('cmdqn6iap000390w9f8jwyeou');

    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'cmdqn6iap000390w9f8jwyeou' }
    });
  });

  test('deve lidar com ID vazio', async () => {
    mockDelete.mockRejectedValue(new Error('Invalid ID'));

    await expect(
      phrasesService.deletePhrase('')
    ).rejects.toThrow('Invalid ID');
  });

  test('deve lidar com ID inválido', async () => {
    mockDelete.mockRejectedValue(new Error('Invalid ID format'));

    await expect(
      phrasesService.deletePhrase('invalid-id-format')
    ).rejects.toThrow('Invalid ID format');
  });
}); 