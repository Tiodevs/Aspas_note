import { PhrasesService } from '../../../services/phrases/phrases.service';

// Mock do Prisma
jest.mock('../../../prisma/client', () => ({
  __esModule: true,
  default: {
    phrase: {
      update: jest.fn(),
    },
  },
}));

import mockPrisma from '../../../prisma/client';
const mockUpdate = (mockPrisma as any).phrase.update;

describe('UpdatePhraseService', () => {
  let phrasesService: PhrasesService;

  beforeEach(() => {
    phrasesService = new PhrasesService();
    jest.clearAllMocks();
  });

  test('deve ter o método updatePhrase', () => {
    expect(typeof phrasesService.updatePhrase).toBe('function');
  });

  test('deve atualizar uma frase com sucesso', async () => {
    const dadosAtualizacao = {
      phrase: 'Frase atualizada',
      author: 'Autor Atualizado',
      tags: ['atualizado']
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase atualizada',
      author: 'Autor Atualizado',
      tags: ['atualizado'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado).toEqual(fraseAtualizada);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'phrase-123' },
      data: dadosAtualizacao
    });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  test('deve falhar quando o banco de dados retorna erro', async () => {
    const erroSimulado = new Error('Erro de conexão com banco');
    mockUpdate.mockRejectedValue(erroSimulado);

    await expect(
      phrasesService.updatePhrase('phrase-123', { phrase: 'Nova frase' })
    ).rejects.toThrow('Erro de conexão com banco');
  });

  test('deve atualizar apenas o campo phrase', async () => {
    const dadosAtualizacao = {
      phrase: 'Apenas a frase foi alterada'
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Apenas a frase foi alterada',
      author: 'Autor Original',
      tags: ['original'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado.phrase).toBe('Apenas a frase foi alterada');
    expect(resultado.author).toBe('Autor Original');
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'phrase-123' },
      data: dadosAtualizacao
    });
  });

  test('deve atualizar apenas o campo author', async () => {
    const dadosAtualizacao = {
      author: 'Novo Autor'
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase Original',
      author: 'Novo Autor',
      tags: ['original'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado.author).toBe('Novo Autor');
    expect(resultado.phrase).toBe('Frase Original');
  });

  test('deve atualizar apenas as tags', async () => {
    const dadosAtualizacao = {
      tags: ['nova', 'tag', 'atualizada']
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase Original',
      author: 'Autor Original',
      tags: ['nova', 'tag', 'atualizada'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado.tags).toEqual(['nova', 'tag', 'atualizada']);
    expect(resultado.tags).toHaveLength(3);
  });

  test('deve atualizar múltiplos campos simultaneamente', async () => {
    const dadosAtualizacao = {
      phrase: 'Frase completamente nova',
      author: 'Autor completamente novo',
      tags: ['completamente', 'nova', 'tag']
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase completamente nova',
      author: 'Autor completamente novo',
      tags: ['completamente', 'nova', 'tag'],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado.phrase).toBe('Frase completamente nova');
    expect(resultado.author).toBe('Autor completamente novo');
    expect(resultado.tags).toEqual(['completamente', 'nova', 'tag']);
  });

  test('deve lidar com tags vazias', async () => {
    const dadosAtualizacao = {
      tags: []
    };

    const fraseAtualizada = {
      id: 'phrase-123',
      phrase: 'Frase Original',
      author: 'Autor Original',
      tags: [],
      userId: 'user123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    };

    mockUpdate.mockResolvedValue(fraseAtualizada);

    const resultado = await phrasesService.updatePhrase('phrase-123', dadosAtualizacao);

    expect(resultado.tags).toEqual([]);
  });
}); 