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

describe('ListPhrasesByUserService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve ter o método listPhrasesByUser', () => {
    expect(typeof phrasesService.listPhrasesByUser).toBe('function');
  });

  test('deve listar frases de um usuário específico com sucesso', async () => {
    const frasesDoUsuario = [
      {
        id: 'phrase-1',
        phrase: 'Frase do usuário 1',
        author: 'Autor 1',
        tags: ['tag1'],
        userId: 'user123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 'phrase-2',
        phrase: 'Frase do usuário 2',
        author: 'Autor 2',
        tags: ['tag2'],
        userId: 'user123',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      }
    ];

    mockFindMany.mockResolvedValue(frasesDoUsuario);

    const resultado = await phrasesService.listPhrasesByUser('user123');

    expect(resultado).toEqual(frasesDoUsuario);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user123'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    expect(mockFindMany).toHaveBeenCalledTimes(1);
  });

  test('deve retornar array vazio quando usuário não tem frases', async () => {
    mockFindMany.mockResolvedValue([]);

    const resultado = await phrasesService.listPhrasesByUser('user-sem-frases');

    expect(resultado).toEqual([]);
    expect(resultado).toHaveLength(0);
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockFindMany.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.listPhrasesByUser('user123')
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
        userId: 'user123',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    mockFindMany.mockResolvedValue(frasesDesordenadas);

    const resultado = await phrasesService.listPhrasesByUser('user123');

    expect(resultado).toHaveLength(2);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user123'
      },
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

    const resultado = await phrasesService.listPhrasesByUser('user123');

    expect(resultado[0].tags).toEqual([]);
  });

  test('deve filtrar corretamente por userId', async () => {
    const frasesDoUsuario = [
      {
        id: 'phrase-1',
        phrase: 'Frase do usuário específico',
        author: 'Autor',
        tags: ['específico'],
        userId: 'user-específico',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFindMany.mockResolvedValue(frasesDoUsuario);

    const resultado = await phrasesService.listPhrasesByUser('user-específico');

    expect(resultado).toHaveLength(1);
    expect(resultado[0].userId).toBe('user-específico');
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-específico'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  });

  test('deve lidar com userId complexo', async () => {
    const frasesDoUsuario = [
      {
        id: 'phrase-1',
        phrase: 'Frase com userId complexo',
        author: 'Autor',
        tags: ['complexo'],
        userId: 'cmdp00uq50000139mwyhjzgor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockFindMany.mockResolvedValue(frasesDoUsuario);

    const resultado = await phrasesService.listPhrasesByUser('cmdp00uq50000139mwyhjzgor');

    expect(resultado).toHaveLength(1);
    expect(resultado[0].userId).toBe('cmdp00uq50000139mwyhjzgor');
  });
}); 