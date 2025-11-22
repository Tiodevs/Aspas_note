import { PhrasesService } from '../../../services/phrases/phrases.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    phrase: {
      create: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';
const mockCreate = (mockPrisma as any).phrase.create;

describe('CreatePhraseService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve criar uma instância do PhrasesService', () => {
    expect(phrasesService).toBeInstanceOf(PhrasesService);
  });

  test('deve ter o método createPhrase', () => {
    expect(typeof phrasesService.createPhrase).toBe('function');
  });

  test('deve criar uma frase com sucesso', async () => {
    const dadosEntrada = {
      phrase: 'A vida é bela',
      author: 'Roberto Benigni',
      tags: ['vida', 'cinema'],
      userId: 'user123'
    };

    const respostaMockada = {
      id: 'phrase456',
      phrase: 'A vida é bela',
      author: 'Roberto Benigni',
      tags: ['vida', 'cinema'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    };

    mockCreate.mockResolvedValue(respostaMockada);

    const resultado = await phrasesService.createPhrase(
      dadosEntrada.phrase,
      dadosEntrada.author,
      dadosEntrada.tags,
      dadosEntrada.userId
    );

    expect(resultado).toEqual(respostaMockada);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        phrase: 'A vida é bela',
        author: 'Roberto Benigni',
        tags: ['vida', 'cinema'],
        userId: 'user123'
      }
    });
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockCreate.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.createPhrase('frase', 'autor', ['tag'], 'user123')
    ).rejects.toThrow('Erro de conexão com banco');
  });

  test('deve criar frase sem tags (array vazio)', async () => {
    const respostaMockada = {
      id: 'phrase789',
      phrase: 'Frase sem tags',
      author: 'Autor Desconhecido',
      tags: [],
      userId: 'user456',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreate.mockResolvedValue(respostaMockada);

    const resultado = await phrasesService.createPhrase(
      'Frase sem tags',
      'Autor Desconhecido',
      [],
      'user456'
    );

    expect(resultado.tags).toEqual([]);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        phrase: 'Frase sem tags',
        author: 'Autor Desconhecido',
        tags: [],
        userId: 'user456'
      }
    });
  });

  test('deve criar frase com múltiplas tags', async () => {
    const muitasTags = ['motivação', 'vida', 'sucesso', 'felicidade', 'amor'];
    const respostaMockada = {
      id: 'phrase999',
      phrase: 'Frase com muitas tags',
      author: 'Filósofo',
      tags: muitasTags,
      userId: 'user789',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreate.mockResolvedValue(respostaMockada);

    const resultado = await phrasesService.createPhrase(
      'Frase com muitas tags',
      'Filósofo',
      muitasTags,
      'user789'
    );

    expect(resultado.tags).toHaveLength(5);
    expect(resultado.tags).toContain('motivação');
    expect(resultado.tags).toContain('amor');
  });

  test('deve funcionar com caracteres especiais', async () => {
    const fraseComEmojis = 'A vida é 🌟 incrível! ✨';
    const autorComAcentos = 'José Antônio da Côrte';
    const tagsEspeciais = ['emojis-🎉', 'acentuação-ção'];

    const respostaMockada = {
      id: 'phrase-especial',
      phrase: fraseComEmojis,
      author: autorComAcentos,
      tags: tagsEspeciais,
      userId: 'user-especial',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreate.mockResolvedValue(respostaMockada);

    const resultado = await phrasesService.createPhrase(
      fraseComEmojis,
      autorComAcentos,
      tagsEspeciais,
      'user-especial'
    );

    expect(resultado.phrase).toContain('🌟');
    expect(resultado.author).toContain('Antônio');
    expect(resultado.tags[0]).toContain('🎉');
  });

  test('deve funcionar com strings muito pequenas', async () => {
    const respostaMockada = {
      id: 'phrase-min',
      phrase: 'A',
      author: 'B',
      tags: ['c'],
      userId: 'u',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockCreate.mockResolvedValue(respostaMockada);

    const resultado = await phrasesService.createPhrase('A', 'B', ['c'], 'u');

    expect(resultado.phrase).toBe('A');
    expect(resultado.author).toBe('B');
    expect(resultado.tags[0]).toBe('c');
  });
}); 