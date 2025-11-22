'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import styles from './page.module.css'
import { Navigation } from '@/components/ui'
import Image from 'next/image'
import { frasesAPI, PhraseFilters, PhraseResponse, Phrase, PhraseUpdateData, PhraseCreateData } from '@/lib/api'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Estados para filtros e dados
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [uniqueAuthors, setUniqueAuthors] = useState<string[]>([])
  const [uniqueTags, setUniqueTags] = useState<string[]>([])
  
  // Estados para o modal de detalhes
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState<PhraseUpdateData>({
    phrase: '',
    author: '',
    tags: []
  })
  
  // Estados para o modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    phrase: '',
    author: '',
    tags: [] as string[]
  })
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([])
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false)
  
  // Estado para feedback de operações
  const [operationMessage, setOperationMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })
  
  // Estado para controlar quando não aplicar filtros automáticos
  const [skipAutoFilters, setSkipAutoFilters] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Função para carregar frases
  const loadPhrases = useCallback(async (filters: PhraseFilters = {}) => {
    if (status !== 'authenticated' || !session?.user?.id) return
    
    setLoading(true)
    try {
      // Incluir o userId da sessão nos filtros
      const filtersWithUserId = {
        ...filters,
        userId: session.user.id
      }
      
      const response: PhraseResponse = await frasesAPI.listar(filtersWithUserId)
      setPhrases(response.phrases)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Erro ao carregar frases:', error)
    } finally {
      setLoading(false)
    }
  }, [status, session?.user?.id])

  // Função para carregar todos os dados iniciais
  const loadInitialData = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) return
    
    setInitialLoading(true)
    try {
      // Carregar todas as opções de filtro e frases em paralelo
      const [authors, tags] = await Promise.all([
        frasesAPI.buscarAutoresUnicos(session.user.id),
        frasesAPI.buscarTagsUnicas(session.user.id)
      ])
      
      setUniqueAuthors(authors)
      setUniqueTags(tags)
      
      // Carregar frases iniciais com userId da sessão
      const response: PhraseResponse = await frasesAPI.listar({ 
        page: 1, 
        limit: 10,
        userId: session.user.id
      })
      setPhrases(response.phrases)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [status, session?.user?.id])

  // Carregar dados iniciais quando autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialData()
    }
  }, [status, loadInitialData])

  // Função para aplicar filtros
  const applyFilters = useCallback(() => {
    const filters: PhraseFilters = {
      page: 1,
      limit: 10
    }

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim()
    }

    if (selectedAuthor && selectedAuthor !== 'all') {
      filters.author = selectedAuthor
    }

    if (selectedTag && selectedTag !== 'all') {
      filters.tag = selectedTag
    }

    loadPhrases(filters)
  }, [searchTerm, selectedAuthor, selectedTag, loadPhrases])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (skipAutoFilters) return
    
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [applyFilters, skipAutoFilters])

  // Função para mudar página
  const changePage = (newPage: number) => {
    const filters: PhraseFilters = {
      page: newPage,
      limit: 10
    }

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim()
    }

    if (selectedAuthor && selectedAuthor !== 'all') {
      filters.author = selectedAuthor
    }

    if (selectedTag && selectedTag !== 'all') {
      filters.tag = selectedTag
    }

    loadPhrases(filters)
  }

  // Função para recarregar filtros únicos
  const loadUniqueFilters = async () => {
    try {
      const [authors, tags] = await Promise.all([
        frasesAPI.buscarAutoresUnicos(),
        frasesAPI.buscarTagsUnicas()
      ])
      
      setUniqueAuthors(authors)
      setUniqueTags(tags)
    } catch (error) {
      console.error('Erro ao carregar filtros únicos:', error)
    }
  }

  // Função para mostrar mensagens de feedback
  const showMessage = (type: 'success' | 'error', text: string) => {
    setOperationMessage({ type, text })
    setTimeout(() => {
      setOperationMessage({ type: null, text: '' })
    }, 3000) // Remove após 3 segundos
  }

  // Função para preparar filtros limpos
  const prepareFilters = (page: number = pagination.page) => {
    const filters: PhraseFilters = {
      page,
      limit: pagination.limit
    }

    if (searchTerm && searchTerm.trim()) {
      filters.search = searchTerm.trim()
    }

    if (selectedAuthor && selectedAuthor !== 'all') {
      filters.author = selectedAuthor
    }

    if (selectedTag && selectedTag !== 'all') {
      filters.tag = selectedTag
    }

    return filters
  }

  // Funções do modal
  const openModal = (phrase: Phrase) => {
    setSelectedPhrase(phrase)
    setEditFormData({
      phrase: phrase.phrase,
      author: phrase.author,
      tags: phrase.tags || []
    })
    setIsModalOpen(true)
    setIsEditMode(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPhrase(null)
    setIsEditMode(false)
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedPhrase) return
    
    try {
      setLoading(true)
      setSkipAutoFilters(true) // Desabilitar filtros automáticos temporariamente
      
      await frasesAPI.atualizar(selectedPhrase.id, editFormData)
      
      // Recarregar as frases e filtros
      await Promise.all([
        loadPhrases(prepareFilters()),
        loadUniqueFilters()
      ])
      
      closeModal()
      showMessage('success', 'Frase atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar frase:', error)
      showMessage('error', 'Erro ao atualizar frase. Tente novamente.')
    } finally {
      setLoading(false)
      setTimeout(() => setSkipAutoFilters(false), 1000) // Reabilitar após 1s
    }
  }

  const handleDelete = async () => {
    if (!selectedPhrase) return
    
    if (true) {
      try {
        setLoading(true)
        setSkipAutoFilters(true) // Desabilitar filtros automáticos temporariamente
        
        await frasesAPI.deletar(selectedPhrase.id)
        
        // Se era a única frase da página e não é a primeira página, voltar para página anterior
        const targetPage = phrases.length === 1 && pagination.page > 1 
          ? pagination.page - 1 
          : pagination.page
        
        // Recarregar as frases e filtros
        await Promise.all([
          loadPhrases(prepareFilters(targetPage)),
          loadUniqueFilters()
        ])
        
        closeModal()
        showMessage('success', 'Frase excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir frase:', error)
        showMessage('error', 'Erro ao excluir frase. Tente novamente.')
      } finally {
        setLoading(false)
        setTimeout(() => setSkipAutoFilters(false), 1000) // Reabilitar após 1s
      }
    }
  }

  // Função para filtrar sugestões de autores
  const handleAuthorChange = (value: string) => {
    setCreateFormData({...createFormData, author: value})
    
    let suggestions: string[]
    
    if (value.trim()) {
      suggestions = uniqueAuthors.filter(author => 
        author.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 20) // Limitar a 20 sugestões
    } else {
      // Se o campo estiver vazio, mostrar todos os autores como sugestões (limitado a 20)
      suggestions = uniqueAuthors.slice(0, 20)
    }
    
    setAuthorSuggestions(suggestions)
    setShowAuthorSuggestions(suggestions.length > 0)
  }

  const handleSelectAuthor = (author: string) => {
    setCreateFormData({...createFormData, author})
    setShowAuthorSuggestions(false)
  }

  const handleAuthorBlur = () => {
    // Usar setTimeout para permitir o clique no item antes de fechar
    setTimeout(() => setShowAuthorSuggestions(false), 200)
  }

  // Funções do modal de criação
  const openCreateModal = () => {
    setCreateFormData({
      phrase: '',
      author: '',
      tags: []
    })
    setAuthorSuggestions([])
    setShowAuthorSuggestions(false)
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreateFormData({
      phrase: '',
      author: '',
      tags: []
    })
    setAuthorSuggestions([])
    setShowAuthorSuggestions(false)
  }

  const handleCreatePhrase = async () => {
    // Validações mais rigorosas
    if (!createFormData.phrase.trim()) {
      showMessage('error', 'A frase é obrigatória.')
      return
    }
    
    if (createFormData.phrase.trim().length < 5) {
      showMessage('error', 'A frase deve ter pelo menos 5 caracteres.')
      return
    }
    
    if (!createFormData.author.trim()) {
      showMessage('error', 'O autor é obrigatório.')
      return
    }
    
    if (createFormData.author.trim().length < 2) {
      showMessage('error', 'O nome do autor deve ter pelo menos 2 caracteres.')
      return
    }

    try {
      setLoading(true)
      setSkipAutoFilters(true)

      // Verificar se temos userId válido (agora deve ser CUID correto)
      const userId = session?.user?.id
      
      if (!userId) {
        showMessage('error', 'Erro de autenticação. Faça login novamente.')
        return
      }

      // Criar a frase com userId correto
      const phraseToCreate: PhraseCreateData = {
        phrase: createFormData.phrase.trim(),
        author: createFormData.author.trim(),
        tags: createFormData.tags.filter(tag => tag.trim().length > 0),
        userId: userId
      }

      // Se o userId não for CUID válido, vamos buscar do backend usando o token
      if (!/^c[a-z0-9]{24}$/.test(userId)) {
        console.log('❌ UserId não é CUID válido, buscando do backend...')
        
        try {
          // Fazer uma chamada para obter o usuário atual do backend
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`,
              'Content-Type': 'application/json',
            }
          })
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            console.log('✅ Dados do usuário do backend:', userData)
            
            if (userData.user?.id) {
              // Atualizar o phraseToCreate com o CUID correto
              phraseToCreate.userId = userData.user.id
              console.log('✅ UserId corrigido:', userData.user.id)
            } else {
              throw new Error('ID do usuário não encontrado na resposta do backend')
            }
          } else {
            throw new Error('Falha ao obter dados do usuário do backend')
          }
        } catch (error) {
          console.error('❌ Erro ao buscar userId do backend:', error)
          showMessage('error', 'Erro de autenticação. Faça logout e login novamente.')
          return
        }
      }

      await frasesAPI.criar(phraseToCreate)

      // Recarregar as frases e filtros
      await Promise.all([
        loadPhrases(prepareFilters(1)), // Voltar para primeira página
        loadUniqueFilters()
      ])

      closeCreateModal()
      showMessage('success', 'Frase criada com sucesso!')
    } catch (error: unknown) {
      console.error('Erro ao criar frase:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar frase. Tente novamente.'
      showMessage('error', errorMessage)
    } finally {
      setLoading(false)
      setTimeout(() => setSkipAutoFilters(false), 1000)
    }
  }

  if (status === 'loading' || initialLoading) {
    return (
      <div className={styles.globalLoadingOverlay}>
        <div className={styles.globalLoadingSpinner}></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>

      <Navigation onAddClick={openCreateModal} />

      <main className={styles.main}>
        {/* Input de pesquisa */}
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Pesquisar" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            name="authorSelect" 
            id="authorSelect"
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className={styles.authorSelect}
          >
            <option value="all">Todos os autores</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
          <select 
            name="tagSelect" 
            id="tagSelect"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={styles.tagSelect}
          >
            <option value="all">Todas as tags</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Lista de frases */}
        <div className={styles.phrasesContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : phrases.length === 0 ? (
            <div className={styles.noResults}>
              <p>Nenhuma frase encontrada</p>
            </div>
          ) : (
            <>
              {phrases.map((phrase) => (
                <div 
                  key={phrase.id} 
                  className={styles.phrasesCard}
                  onClick={() => openModal(phrase)}
                >
                  <div className={styles.phraseContent}>
                    <p className={styles.phraseText}>&ldquo;{phrase.phrase}&rdquo;</p>
                    <p className={styles.phraseAuthor}>— <span className={styles.phraseAuthorName}>{phrase.author}</span></p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Paginação */}
        {pagination.pages > 1 && (
          <div className={styles.paginationContainer}>
            <button 
              onClick={() => changePage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={styles.paginationButton}
            >
              Anterior
            </button>
            
            <div className={styles.paginationInfo}>
              <span>
                Página {pagination.page} de {pagination.pages}
              </span>
            </div>
            
            <button 
              onClick={() => changePage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={styles.paginationButton}
            >
              Próxima
            </button>
          </div>
        )}
      </main>

      {/* Modal de detalhes da frase */}
      {isModalOpen && selectedPhrase && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes da Frase</h2>
            </div>
            
            <div className={styles.modalBody}>
              {isEditMode ? (
                // Modo de edição
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Frase:</label>
                    <textarea
                      value={editFormData.phrase}
                      onChange={(e) => setEditFormData({...editFormData, phrase: e.target.value})}
                      className={styles.editTextarea}
                      rows={3}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Autor:</label>
                    <input
                      type="text"
                      value={editFormData.author}
                      onChange={(e) => setEditFormData({...editFormData, author: e.target.value})}
                      className={styles.editInput}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Tags (separadas por vírgula):</label>
                    <input
                      type="text"
                      value={editFormData.tags.join(', ')}
                      onChange={(e) => setEditFormData({
                        ...editFormData, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      className={styles.editInput}
                    />
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className={styles.phraseDetails}>
                  <div className={styles.detailItem}>
                    <strong>Frase:</strong>
                    <p className={styles.detailPhrase}>&ldquo;{selectedPhrase.phrase}&rdquo;</p>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <strong>Autor:</strong>
                    <p>{selectedPhrase.author}</p>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <strong>Data de criação:</strong>
                    <p>{new Date(selectedPhrase.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  
                  {selectedPhrase.tags && selectedPhrase.tags.length > 0 && (
                    <div className={styles.detailItem}>
                      <strong>Tags:</strong>
                      <div className={styles.modalTags}>
                        {selectedPhrase.tags.map((tag, index) => (
                          <span key={index} className={styles.modalTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className={styles.modalActions}>
              {isEditMode ? (
                <>
                  <button onClick={handleSaveEdit} className={styles.saveButton}>
                    Salvar
                  </button>
                  <button onClick={() => setIsEditMode(false)} className={styles.cancelButton}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className={styles.editButton}>
                    <Image src="/images/icons/Pan.svg" alt="Editar" width={18} height={18} />
                    Editar
                  </button>
                  <button onClick={handleDelete} className={styles.deleteButton}>
                    <Image src="/images/icons/Trash.svg" alt="Excluir" width={18} height={18} />
                    Excluir
                  </button>
                  <button onClick={closeModal} className={styles.cancelButton}>
                    <p>x</p>
                    Sair
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de criação de frase */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={closeCreateModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Criar Nova Frase</h2>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Frase:</label>
                  <textarea
                    value={createFormData.phrase}
                    onChange={(e) => setCreateFormData({...createFormData, phrase: e.target.value})}
                    className={styles.editTextarea}
                    rows={3}
                    placeholder="Digite a frase aqui..."
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Autor:</label>
                  <div className={styles.autocompleteContainer}>
                    <input
                      type="text"
                      value={createFormData.author}
                      onChange={(e) => handleAuthorChange(e.target.value)}
                      onFocus={() => {
                        if (createFormData.author.trim()) {
                          const filtered = uniqueAuthors.filter(author => 
                            author.toLowerCase().includes(createFormData.author.toLowerCase())
                          ).slice(0, 20)
                          setAuthorSuggestions(filtered)
                          setShowAuthorSuggestions(filtered.length > 0)
                        } else {
                          // Se o campo estiver vazio, mostrar todos os autores (limitado a 20)
                          const suggestions = uniqueAuthors.slice(0, 20)
                          setAuthorSuggestions(suggestions)
                          setShowAuthorSuggestions(suggestions.length > 0)
                        }
                      }}
                      onBlur={handleAuthorBlur}
                      className={styles.editInput}
                      placeholder="Digite ou selecione um autor"
                    />
                    {showAuthorSuggestions && authorSuggestions.length > 0 && (
                      <div className={styles.autocompleteDropdown}>
                        {authorSuggestions.map(author => (
                          <div 
                            key={author} 
                            className={styles.autocompleteItem}
                            onClick={() => handleSelectAuthor(author)}
                          >
                            {author}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Tags (separadas por vírgula):</label>
                  <input
                    type="text"
                    value={createFormData.tags.join(', ')}
                    onChange={(e) => setCreateFormData({
                      ...createFormData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    className={styles.editInput}
                    placeholder="motivação, inspiração, sucesso..."
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button onClick={handleCreatePhrase} className={styles.saveButton}>
                Criar Frase
              </button>
              <button onClick={closeCreateModal} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação de operações */}
      {operationMessage.type && (
        <div className={`${styles.notification} ${styles[`notification${operationMessage.type.charAt(0).toUpperCase() + operationMessage.type.slice(1)}`]}`}>
          {operationMessage.text}
        </div>
      )}

    </div>
  )
}
