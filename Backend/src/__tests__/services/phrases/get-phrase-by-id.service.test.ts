import { PhrasesService } from '../../../services/phrases/phrases.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    phrase: {
      findUnique: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';
const mockFindUnique = (mockPrisma as any).phrase.findUnique;

describe('GetPhraseByIdService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve ter o método getPhraseById', () => {
    expect(typeof phrasesService.getPhraseById).toBe('function');
  });

  test('deve buscar uma frase por ID com sucesso', async () => {
    const fraseMockada = {
      id: 'phrase-123',
      phrase: 'A vida é bela',
      author: 'Roberto Benigni',
      tags: ['vida', 'cinema'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    };

    mockFindUnique.mockResolvedValue(fraseMockada);

    const resultado = await phrasesService.getPhraseById('phrase-123');

    expect(resultado).toEqual(fraseMockada);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'phrase-123' }
    });
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  test('deve retornar null quando frase não é encontrada', async () => {
    mockFindUnique.mockResolvedValue(null);

    const resultado = await phrasesService.getPhraseById('phrase-inexistente');

    expect(resultado).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'phrase-inexistente' }
    });
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockFindUnique.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.getPhraseById('phrase-123')
    ).rejects.toThrow('Erro de conexão com banco');
  });

  test('deve buscar frase com ID válido mas complexo', async () => {
    const fraseComIdComplexo = {
      id: 'cmdqn6iap000390w9f8jwyeou',
      phrase: 'Frase com ID complexo',
      author: 'Autor Teste',
      tags: ['teste'],
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindUnique.mockResolvedValue(fraseComIdComplexo);

    const resultado = await phrasesService.getPhraseById('cmdqn6iap000390w9f8jwyeou');

    expect(resultado).toEqual(fraseComIdComplexo);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'cmdqn6iap000390w9f8jwyeou' }
    });
  });

  test('deve lidar com frase que não tem tags', async () => {
    const fraseSemTags = {
      id: 'phrase-123',
      phrase: 'Frase sem tags',
      author: 'Autor',
      tags: [],
      userId: 'user123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockFindUnique.mockResolvedValue(fraseSemTags);

    const resultado = await phrasesService.getPhraseById('phrase-123');

    expect(resultado?.tags).toEqual([]);
  });
}); 