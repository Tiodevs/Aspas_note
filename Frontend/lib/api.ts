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
      try {
        const errorData = await response.json()
        console.error('Detalhes do erro da API POST:', errorData)
        
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
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async put(endpoint: string, data: PhraseUpdateData) {
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



// Exemplo de uso:
// import { frasesAPI } from '@/lib/api'
// const minhasFrases = await frasesAPI.listar()
