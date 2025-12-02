import { getSession } from 'next-auth/react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

class ApiClient {
  private async getAuthHeaders() {
    const session = await getSession()
    
    if (!session?.accessToken) {
      throw new Error('Token de acesso não encontrado')
    }

    return {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    }
  }

  async get(endpoint: string, params?: Record<string, unknown>) {
    const headers = await this.getAuthHeaders()
    
    let url = `${API_BASE_URL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    return response.json()
  }

  async post(endpoint: string, data: unknown) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = `Erro na API: ${response.status}`
      let errorCode: string | undefined
      try {
        const errorData = await response.json()
        console.error('Detalhes do erro da API POST:', errorData)
        
        // Capturar o código de erro se existir
        if (errorData.code) {
          errorCode = errorData.code
        }
        
        if (errorData.error) {
          errorMessage += ` - ${errorData.error}`
        }
        
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details.map((detail: { field: string; message: string }) => 
            `${detail.field}: ${detail.message}`
          ).join(', ')
          errorMessage += ` - ${validationErrors}`
        } else if (errorData.details) {
          if (typeof errorData.details === 'object') {
            errorMessage += ` - ${JSON.stringify(errorData.details)}`
          } else {
            errorMessage += ` - ${errorData.details}`
          }
        }
        
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`
        }
      } catch (e) {
        console.error('Erro ao fazer parse do JSON de erro:', e)
      }
      
      const error = new Error(errorMessage) as Error & { code?: string; status?: number }
      error.code = errorCode
      error.status = response.status
      throw error
    }

    return response.json()
  }

  async put(endpoint: string, data: PhraseUpdateData | UpdateProfileData | Record<string, unknown>) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    return response.json()
  }

  async delete(endpoint: string) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    // Verificar se há conteúdo na resposta antes de tentar fazer JSON
    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    
    if (contentLength === '0' || response.status === 204) {
      return {} // Retorna objeto vazio para DELETE bem-sucedido sem conteúdo
    }
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await response.text()
        return text ? JSON.parse(text) : {}
      } catch (error) {
        console.warn('Erro ao fazer parse do JSON na resposta DELETE:', error)
        return {}
      }
    }
    
    return {} // Fallback para resposta sem JSON
  }
}

// Instância única do cliente API
export const apiClient = new ApiClient()

// Interface para filtros de frases
export interface PhraseFilters {
  userId?: string
  author?: string
  search?: string
  tag?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

// Interface para frase com informações do usuário (usado no feed)
export interface PhraseWithUser extends Phrase {
  user: {
    id: string;
    name: string | null;
    username: string;
  };
}

// Funções específicas para frases
export const frasesAPI = {
  listar: (filters?: PhraseFilters) => apiClient.get('/phrases', filters),
  buscarPorId: (id: string) => apiClient.get(`/phrases/${id}`),
  criar: (frase: PhraseCreateData) => apiClient.post('/phrases', frase),
  atualizar: (id: string, frase: PhraseUpdateData) => apiClient.put(`/phrases/${id}`, frase),
  deletar: (id: string) => apiClient.delete(`/phrases/${id}`),
  listarPorUsuario: (userId: string) => apiClient.get(`/phrases/user/${userId}`),
  // Novos endpoints otimizados para filtros
  buscarAutoresUnicos: (userId?: string): Promise<string[]> => 
    apiClient.get('/phrases/filters/authors', userId ? { userId } : undefined),
  buscarTagsUnicas: (userId?: string): Promise<string[]> => 
    apiClient.get('/phrases/filters/tags', userId ? { userId } : undefined),
  // Feed de frases
  getFeed: (page?: number, limit?: number): Promise<{ phrases: PhraseWithUser[]; pagination: { page: number; limit: number; total: number; pages: number } }> => 
    apiClient.get('/phrases/feed', { page, limit }),
}

// Funções para IA
export interface ExtractedPhrase {
  phrase: string;
  author: string | null;
  tags: string[];
  confidence: number;
  context?: string;
}

export interface PhraseExtractionResult {
  phrases: ExtractedPhrase[];
  totalFound: number;
}

export const aiAPI = {
  extractPhrases: (text: string): Promise<PhraseExtractionResult> => 
    apiClient.post('/ai/extract-phrases', { text }),
}

export interface Phrase {
  id: string;
  phrase: string;
  author: string;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhraseUpdateData {
  phrase: string;
  author: string;
  tags: string[];
}

export interface PhraseCreateData {
  phrase: string;
  author: string;
  tags: string[];
  userId: string;
}

export interface PhraseResponse {
  phrases: Phrase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Interfaces para Profile
export interface UpdateProfileData {
  avatar?: string | null;
  bio?: string | null;
}

export interface Profile {
  id: string;
  avatar: string | null;
  bio: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
  user: {
    id: string;
    name: string | null;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

// Interface para o relatório mensal
export interface MonthlyReport {
  phrasesCreated: {
    current: number;
    previous: number;
    change: number;
  };
  phrasesMemorized: {
    current: number;
    previous: number;
    change: number;
  };
  newFollowers: {
    current: number;
    previous: number;
    change: number;
  };
  likes: {
    current: number;
    previous: number;
    change: number;
  };
}

// Funções específicas para Profile
export const profileAPI = {
  getMyProfile: (): Promise<Profile> => apiClient.get('/profile/me'),
  getByUserId: (userId: string): Promise<Profile> => apiClient.get(`/profile/user/${userId}`),
  getById: (id: string): Promise<Profile> => apiClient.get(`/profile/${id}`),
  update: (data: UpdateProfileData): Promise<{ message: string; profile: Profile }> => 
    apiClient.put('/profile/me', data),
  create: (data: UpdateProfileData): Promise<{ message: string; profile: Profile }> => 
    apiClient.post('/profile', data),
  getFollowers: (userId: string): Promise<Array<{ id: string; userId: string }>> => apiClient.get(`/profile/user/${userId}/followers`),
  getFollowing: (userId: string): Promise<Array<{ id: string; userId: string }>> => apiClient.get(`/profile/user/${userId}/following`),
  follow: (followingUserId: string): Promise<{ message: string }> => 
    apiClient.post('/profile/follow', { followingUserId }),
  unfollow: (followingUserId: string): Promise<{ message: string }> => 
    apiClient.post('/profile/unfollow', { followingUserId }),
  getMonthlyReport: (): Promise<MonthlyReport> => apiClient.get('/profile/me/monthly-report'),
}

// Interfaces para Decks e Repetição Espaçada
export interface Deck {
  id: string
  name: string
  description?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  _count?: { cards: number }
}

export interface Card {
  id: string
  phraseId: string
  deckId: string
  userId: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewedAt?: string | null
  phrase?: Phrase
  deck?: Deck
}

export interface ReviewQueueItem {
  cardId: string
  phraseId: string
  phrase: string
  author: string
  tags: string[]
  deckId: string
  deckName: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewedAt: string | null
  isNew: boolean
}

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export interface ReviewStats {
  totalCards: number
  newCards: number
  dueCards: number
  overdueCards: number
  gradeStats: {
    AGAIN: number
    HARD: number
    GOOD: number
    EASY: number
  }
}

export interface DeckFilters {
  userId?: string
  page?: number
  limit?: number
  [key: string]: string | number | undefined
}

// Funções de API para Decks
export const decksAPI = {
  // Baralhos
  listar: (filters?: DeckFilters): Promise<{ decks: Deck[]; pagination: { page: number; limit: number; total: number; pages: number } }> =>
    apiClient.get('/decks', filters),
  
  buscarPorId: (id: string): Promise<Deck & { cards: Card[] }> =>
    apiClient.get(`/decks/${id}`),
  
  criar: (data: { name: string; description?: string; userId: string }): Promise<Deck> =>
    apiClient.post('/decks', data),
  
  atualizar: (id: string, data: { name?: string; description?: string }): Promise<Deck> =>
    apiClient.put(`/decks/${id}`, data),
  
  deletar: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/decks/${id}`),
  
  // Cartões
  listarCartoes: (deckId: string, page?: number, limit?: number): Promise<{ cards: Card[]; pagination: { page: number; limit: number; total: number; pages: number } }> =>
    apiClient.get(`/decks/${deckId}/cards`, { page, limit }),
  
  adicionarFrase: (deckId: string, phraseId: string): Promise<Card> =>
    apiClient.post(`/decks/${deckId}/phrases`, { phraseId }),
  
  removerFrase: (cardId: string): Promise<{ message: string }> =>
    apiClient.delete(`/decks/cards/${cardId}`),
}

// Funções de API para Reviews
export const reviewsAPI = {
  obterFila: (deckId?: string, limit?: number): Promise<{ queue: ReviewQueueItem[]; count: number }> =>
    apiClient.get('/reviews/queue', { deckId, limit }),
  
  processarRevisao: async (cardId: string, grade: Grade): Promise<{ success: boolean; card: Card; changes: Record<string, unknown> }> => {
    // Obter userId da sessão
    const session = await getSession()
    if (!session?.user?.id) {
      throw new Error('Usuário não autenticado')
    }
    
    return apiClient.post('/reviews', { cardId, grade, userId: session.user.id })
  },
  
  obterEstatisticas: (deckId?: string): Promise<ReviewStats> =>
    apiClient.get('/reviews/stats', deckId ? { deckId } : undefined),
}

// Exemplo de uso:
// import { frasesAPI } from '@/lib/api'
// const minhasFrases = await frasesAPI.listar()
