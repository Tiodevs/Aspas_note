import { PhrasesService } from '../../../services/phrases/phrases.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    phrase: {
      findMany: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';
const mockFindMany = (mockPrisma as any).phrase.findMany;

describe('ListPhrasesService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve ter o método listPhrase', () => {
    expect(typeof phrasesService.listPhrase).toBe('function');
  });

  test('deve listar todas as frases com sucesso', async () => {
    const frasesMockadas = [
      {
        id: 'phrase-1',
        phrase: 'A vida é bela',
        author: 'Roberto Benigni',
        tags: ['vida', 'cinema'],
        userId: 'user123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'phrase-2',
        phrase: 'Carpe diem',
        author: 'Horácio',
        tags: ['latim', 'filosofia'],
        userId: 'user456',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      }
    ];

    mockFindMany.mockResolvedValue(frasesMockadas);

    const resultado = await phrasesService.listPhrase({}, 'user123');

    expect(resultado).toEqual(frasesMockadas);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc'
      }
    });
    expect(mockFindMany).toHaveBeenCalledTimes(1);
  });

  test('deve retornar array vazio quando não há frases', async () => {
    mockFindMany.mockResolvedValue([]);

    const resultado = await phrasesService.listPhrase({}, 'user123');

    expect(resultado).toEqual([]);
    expect(resultado).toHaveLength(0);
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockFindMany.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.listPhrase({}, 'user123')
    ).rejects.toThrow('Erro de conexão com banco');
  });

  test('deve retornar frases ordenadas por data de criação (mais recente primeiro)', async () => {
    const frasesDesordenadas = [
      {
        id: 'phrase-1',
        phrase: 'Frase antiga',
        author: 'Autor 1',
        tags: ['antiga'],
        userId: 'user123',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: 'phrase-2',
        phrase: 'Frase recente',
        author: 'Autor 2',
        tags: ['recente'],
        userId: 'user456',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    mockFindMany.mockResolvedValue(frasesDesordenadas);

    const resultado = await phrasesService.listPhrase({}, 'user123');

    expect(resultado).toHaveLength(2);
    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc'
      }
    });
  });

  test('deve lidar com frases que não têm tags', async () => {
    const frasesSemTags = [
      {
        id: 'phrase-1',
        phrase: 'Frase sem tags',
        author: 'Autor',
        tags: [],
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFindMany.mockResolvedValue(frasesSemTags);

    const resultado = await phrasesService.listPhrase({}, 'user123');

    expect(resultado[0].tags).toEqual([]);
  });
}); 