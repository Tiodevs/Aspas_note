'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import styles from './page.module.css'
import { Navigation, Logo, PhraseCard } from '@/components/ui'
import { frasesAPI, decksAPI, aiAPI, PhraseFilters, PhraseResponse, Phrase, PhraseUpdateData, PhraseCreateData, Deck, ExtractedPhrase } from '@/lib/api'
import { Edit, Trash2, X, Filter, Plus, Search, Sparkles, Loader2 } from 'lucide-react'

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
  const [editTagInput, setEditTagInput] = useState('')
  const [createTagInput, setCreateTagInput] = useState('')
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([])
  const [editDeckInput, setEditDeckInput] = useState('')
  const [createDeckInput, setCreateDeckInput] = useState('')
  
  // Estados para o modal de detalhes
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState<PhraseUpdateData & { decks: string[] }>({
    phrase: '',
    author: '',
    tags: [],
    decks: []
  })
  
  // Estados para o modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    phrase: '',
    author: '',
    tags: [] as string[],
    decks: [] as string[]
  })
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([])
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false)
  const [editAuthorSuggestions, setEditAuthorSuggestions] = useState<string[]>([])
  const [showEditAuthorSuggestions, setShowEditAuthorSuggestions] = useState(false)
  
  // Estado para feedback de operações
  const [operationMessage, setOperationMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })
  
  // Estado para controlar quando não aplicar filtros automáticos
  const [skipAutoFilters, setSkipAutoFilters] = useState(false)
  
  // Estado para o modal de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  
  // Estados para o modal de extração de frases com IA
  const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false)
  const [extractionText, setExtractionText] = useState('')
  const [extractedPhrases, setExtractedPhrases] = useState<ExtractedPhrase[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [selectedExtractedPhrases, setSelectedExtractedPhrases] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated' || !session) {
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
      // Carregar todas as opções de filtro, decks e frases em paralelo
      const [authors, tags, decksResponse] = await Promise.all([
        frasesAPI.buscarAutoresUnicos(),
        frasesAPI.buscarTagsUnicas(session.user.id),
        decksAPI.listar({ userId: session.user.id })
      ])
      
      // Garantir que authors seja um array válido
      setUniqueAuthors(Array.isArray(authors) ? authors : [])
      setUniqueTags(Array.isArray(tags) ? tags : [])
      setAvailableDecks(decksResponse.decks)
      
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
    if (status !== 'authenticated' || !session?.user?.id) return
    
    try {
      const [authors, tags] = await Promise.all([
        frasesAPI.buscarAutoresUnicos(),
        frasesAPI.buscarTagsUnicas(session.user.id)
      ])
      
      // Garantir que authors seja um array válido
      setUniqueAuthors(Array.isArray(authors) ? authors : [])
      setUniqueTags(Array.isArray(tags) ? tags : [])
    } catch (error) {
      console.error('Erro ao carregar filtros únicos:', error)
      // Em caso de erro, manter os valores atuais ou definir arrays vazios
      setUniqueAuthors([])
      setUniqueTags([])
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

  // Função para buscar decks associados a uma frase
  const loadPhraseDecks = async (phraseId: string): Promise<string[]> => {
    try {
      if (!session?.user?.id) return []
      
      // Buscar todos os decks do usuário e verificar quais têm a frase
      const decksResponse = await decksAPI.listar({ userId: session.user.id })
      const phraseDecks: string[] = []
      
      // Para cada deck, verificar se tem a frase
      for (const deck of decksResponse.decks) {
        try {
          const cardsResponse = await decksAPI.listarCartoes(deck.id, 1, 1000)
          const hasPhrase = cardsResponse.cards.some(card => card.phraseId === phraseId)
          if (hasPhrase) {
            phraseDecks.push(deck.id)
          }
        } catch (error) {
          // Ignorar erros ao buscar cards de um deck
          console.error(`Erro ao buscar cards do deck ${deck.id}:`, error)
        }
      }
      
      return phraseDecks
    } catch (error) {
      console.error('Erro ao buscar decks da frase:', error)
      return []
    }
  }

  // Funções do modal
  const openModal = async (phrase: Phrase) => {
    setSelectedPhrase(phrase)
    const phraseDecks = await loadPhraseDecks(phrase.id)
    setEditFormData({
      phrase: phrase.phrase,
      author: phrase.author,
      tags: phrase.tags || [],
      decks: phraseDecks
    })
    setEditTagInput('')
    setEditDeckInput('')
    setEditAuthorSuggestions([])
    setShowEditAuthorSuggestions(false)
    setIsModalOpen(true)
    setIsEditMode(false)
    
    // Garantir que os autores estejam carregados quando o modal abrir
    if (uniqueAuthors.length === 0 && status === 'authenticated') {
      loadUniqueFilters()
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPhrase(null)
    setIsEditMode(false)
    setEditTagInput('')
    setEditDeckInput('')
    setEditAuthorSuggestions([])
    setShowEditAuthorSuggestions(false)
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedPhrase) return
    
    try {
      setLoading(true)
      setSkipAutoFilters(true) // Desabilitar filtros automáticos temporariamente
      
      // Atualizar a frase
      await frasesAPI.atualizar(selectedPhrase.id, editFormData)
      
      // Buscar decks antigos da frase
      const oldDecks = await loadPhraseDecks(selectedPhrase.id)
      
      // Decks para adicionar (novos que não estavam antes)
      const decksToAdd = editFormData.decks.filter(deckId => !oldDecks.includes(deckId))
      
      // Decks para remover (antigos que não estão mais selecionados)
      const decksToRemove = oldDecks.filter(deckId => !editFormData.decks.includes(deckId))
      
      // Adicionar frase aos novos decks
      for (const deckId of decksToAdd) {
        try {
          await decksAPI.adicionarFrase(deckId, selectedPhrase.id)
        } catch (error) {
          console.error(`Erro ao adicionar frase ao deck ${deckId}:`, error)
        }
      }
      
      // Remover frase dos decks antigos
      for (const deckId of decksToRemove) {
        try {
          // Buscar o card para obter o ID
          const cardsResponse = await decksAPI.listarCartoes(deckId, 1, 1000)
          const card = cardsResponse.cards.find(c => c.phraseId === selectedPhrase.id)
          if (card) {
            await decksAPI.removerFrase(card.id)
          }
        } catch (error) {
          console.error(`Erro ao remover frase do deck ${deckId}:`, error)
        }
      }
      
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
    
    // Verificar se uniqueAuthors está disponível
    if (!uniqueAuthors || uniqueAuthors.length === 0) {
      setAuthorSuggestions([])
      setShowAuthorSuggestions(false)
      return
    }
    
    let suggestions: string[]
    
    if (value.trim()) {
      // Filtrar autores que contêm o texto digitado (case-insensitive)
      suggestions = uniqueAuthors
        .filter(author => author && author.trim() !== '')
        .filter(author => 
          author.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 20) // Limitar a 20 sugestões
    } else {
      // Se o campo estiver vazio, mostrar todos os autores como sugestões (limitado a 20)
      suggestions = uniqueAuthors
        .filter(author => author && author.trim() !== '')
        .slice(0, 20)
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

  // Funções para autocomplete de autor no modo de edição
  const handleEditAuthorChange = (value: string) => {
    setEditFormData({...editFormData, author: value})
    
    // Verificar se uniqueAuthors está disponível
    if (!uniqueAuthors || uniqueAuthors.length === 0) {
      setEditAuthorSuggestions([])
      setShowEditAuthorSuggestions(false)
      return
    }
    
    let suggestions: string[]
    
    if (value.trim()) {
      // Filtrar autores que contêm o texto digitado (case-insensitive)
      suggestions = uniqueAuthors
        .filter(author => author && author.trim() !== '')
        .filter(author => 
          author.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 20) // Limitar a 20 sugestões
    } else {
      // Se o campo estiver vazio, mostrar todos os autores como sugestões (limitado a 20)
      suggestions = uniqueAuthors
        .filter(author => author && author.trim() !== '')
        .slice(0, 20)
    }
    
    setEditAuthorSuggestions(suggestions)
    setShowEditAuthorSuggestions(suggestions.length > 0)
  }

  const handleSelectEditAuthor = (author: string) => {
    setEditFormData({...editFormData, author})
    setShowEditAuthorSuggestions(false)
  }

  const handleEditAuthorBlur = () => {
    // Usar setTimeout para permitir o clique no item antes de fechar
    setTimeout(() => setShowEditAuthorSuggestions(false), 200)
  }

  type TagMode = 'edit' | 'create'

  const sanitizeTag = (tag: string) => tag.replace(/\s+/g, ' ').trim()

  const addTag = (tag: string, mode: TagMode) => {
    const sanitized = sanitizeTag(tag)
    if (!sanitized) return

    if (mode === 'edit') {
      setEditFormData(prev => {
        if (prev.tags.some(existing => existing.toLowerCase() === sanitized.toLowerCase())) {
          return prev
        }
        return {
          ...prev,
          tags: [...prev.tags, sanitized]
        }
      })
      setEditTagInput('')
    } else {
      setCreateFormData(prev => {
        if (prev.tags.some(existing => existing.toLowerCase() === sanitized.toLowerCase())) {
          return prev
        }
        return {
          ...prev,
          tags: [...prev.tags, sanitized]
        }
      })
      setCreateTagInput('')
    }
  }

  const removeTag = (tag: string, mode: TagMode) => {
    if (mode === 'edit') {
      setEditFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(existing => existing !== tag)
      }))
    } else {
      setCreateFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(existing => existing !== tag)
      }))
    }
  }

  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    mode: TagMode
  ) => {
    const currentValue = mode === 'edit' ? editTagInput : createTagInput
    const selectedTags = mode === 'edit' ? editFormData.tags : createFormData.tags

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(currentValue, mode)
    }

    if (event.key === 'Backspace' && !currentValue) {
      const lastTag = selectedTags[selectedTags.length - 1]
      if (lastTag) {
        event.preventDefault()
        removeTag(lastTag, mode)
      }
    }
  }

  const getTagSuggestions = useCallback(
    (inputValue: string, selectedTags: string[]) => {
      const normalizedInput = inputValue.trim().toLowerCase()
      return uniqueTags
        .filter(tag => !selectedTags.some(selected => selected.toLowerCase() === tag.toLowerCase()))
        .filter(tag => !normalizedInput || tag.toLowerCase().includes(normalizedInput))
        .slice(0, 8)
    },
    [uniqueTags]
  )

  const editTagSuggestions = useMemo(
    () => getTagSuggestions(editTagInput, editFormData.tags),
    [editTagInput, editFormData.tags, getTagSuggestions]
  )

  const createTagSuggestions = useMemo(
    () => getTagSuggestions(createTagInput, createFormData.tags),
    [createTagInput, createFormData.tags, getTagSuggestions]
  )

  // Funções para gerenciar decks
  type DeckMode = 'edit' | 'create'

  const addDeck = (deckId: string, mode: DeckMode) => {
    if (mode === 'edit') {
      setEditFormData(prev => {
        if (prev.decks.includes(deckId)) {
          return prev
        }
        return {
          ...prev,
          decks: [...prev.decks, deckId]
        }
      })
      setEditDeckInput('')
    } else {
      setCreateFormData(prev => {
        if (prev.decks.includes(deckId)) {
          return prev
        }
        return {
          ...prev,
          decks: [...prev.decks, deckId]
        }
      })
      setCreateDeckInput('')
    }
  }

  const createAndAddDeck = async (deckName: string, mode: DeckMode) => {
    if (!deckName.trim()) return
    
    if (!session?.user?.id) {
      showMessage('error', 'Erro de autenticação. Faça login novamente.')
      return
    }

    try {
      setLoading(true)
      
      // Criar o novo deck
      const newDeck = await decksAPI.criar({
        name: deckName.trim(),
        userId: session.user.id
      })
      
      // Adicionar o deck à lista de decks disponíveis
      setAvailableDecks(prev => [...prev, newDeck])
      
      // Adicionar o deck aos selecionados
      addDeck(newDeck.id, mode)
      
      showMessage('success', `Deck "${newDeck.name}" criado com sucesso!`)
    } catch (error) {
      console.error('Erro ao criar deck:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar deck. Tente novamente.'
      showMessage('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeckAdd = async (mode: DeckMode) => {
    const deckInput = mode === 'edit' ? editDeckInput : createDeckInput
    
    if (!deckInput.trim()) return
    
    // Verificar se o deck já existe
    const existingDeck = availableDecks.find(d => d.name.toLowerCase() === deckInput.toLowerCase())
    
    if (existingDeck) {
      // Se existe, apenas adicionar
      addDeck(existingDeck.id, mode)
    } else {
      // Se não existe, criar novo deck
      await createAndAddDeck(deckInput, mode)
    }
  }

  const handleDeckKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    mode: DeckMode
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleDeckAdd(mode)
    }
  }

  const removeDeck = (deckId: string, mode: DeckMode) => {
    if (mode === 'edit') {
      setEditFormData(prev => ({
        ...prev,
        decks: prev.decks.filter(id => id !== deckId)
      }))
    } else {
      setCreateFormData(prev => ({
        ...prev,
        decks: prev.decks.filter(id => id !== deckId)
      }))
    }
  }

  const getDeckSuggestions = useCallback(
    (inputValue: string, selectedDeckIds: string[]) => {
      const normalizedInput = inputValue.trim().toLowerCase()
      return availableDecks
        .filter(deck => !selectedDeckIds.includes(deck.id))
        .filter(deck => !normalizedInput || deck.name.toLowerCase().includes(normalizedInput))
        .slice(0, 8)
    },
    [availableDecks]
  )

  const editDeckSuggestions = useMemo(
    () => getDeckSuggestions(editDeckInput, editFormData.decks),
    [editDeckInput, editFormData.decks, getDeckSuggestions]
  )

  const createDeckSuggestions = useMemo(
    () => getDeckSuggestions(createDeckInput, createFormData.decks),
    [createDeckInput, createFormData.decks, getDeckSuggestions]
  )

  // Funções do modal de criação
  const openCreateModal = () => {
    setCreateFormData({
      phrase: '',
      author: '',
      tags: [],
      decks: []
    })
    setAuthorSuggestions([])
    setShowAuthorSuggestions(false)
    setCreateTagInput('')
    setCreateDeckInput('')
    setIsCreateModalOpen(true)
    
    // Garantir que os autores estejam carregados quando o modal abrir
    if (uniqueAuthors.length === 0 && status === 'authenticated') {
      loadUniqueFilters()
    }
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    setCreateFormData({
      phrase: '',
      author: '',
      tags: [],
      decks: []
    })
    setAuthorSuggestions([])
    setShowAuthorSuggestions(false)
    setCreateTagInput('')
    setCreateDeckInput('')
  }

  // Funções para extração de frases com IA
  const handleExtractPhrases = async () => {
    if (extractionText.length < 50) {
      showMessage('error', 'O texto deve ter pelo menos 50 caracteres.')
      return
    }

    try {
      setIsExtracting(true)
      const result = await aiAPI.extractPhrases(extractionText)
      setExtractedPhrases(result.phrases)
      setSelectedExtractedPhrases(new Set())
      
      if (result.phrases.length === 0) {
        showMessage('error', 'Nenhuma frase relevante foi encontrada no texto.')
      } else {
        showMessage('success', `${result.phrases.length} frase(s) extraída(s) com sucesso!`)
      }
    } catch (error: unknown) {
      console.error('Erro ao extrair frases:', error)
      const err = error as { message?: string }
      const errorMessage = err.message || 'Erro ao extrair frases. Tente novamente.'
      showMessage('error', errorMessage)
    } finally {
      setIsExtracting(false)
    }
  }

  const toggleSelectExtractedPhrase = (index: number) => {
    setSelectedExtractedPhrases(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleImportSelectedPhrases = () => {
    if (selectedExtractedPhrases.size === 0) {
      showMessage('error', 'Selecione pelo menos uma frase para importar.')
      return
    }

    // Se apenas uma frase foi selecionada, preencher o formulário diretamente
    if (selectedExtractedPhrases.size === 1) {
      const index = Array.from(selectedExtractedPhrases)[0]
      const extracted = extractedPhrases[index]
      setCreateFormData({
        phrase: extracted.phrase,
        author: extracted.author || '',
        tags: extracted.tags,
        decks: []
      })
      setIsExtractionModalOpen(false)
      setIsCreateModalOpen(true)
    } else {
      // Se múltiplas frases, criar todas de uma vez
      handleCreateMultiplePhrases()
    }

    // Limpar estados
    setExtractionText('')
    setExtractedPhrases([])
    setSelectedExtractedPhrases(new Set())
  }

  const handleCreateMultiplePhrases = async () => {
    const phrasesToCreate = Array.from(selectedExtractedPhrases).map(index => extractedPhrases[index])
    
    if (!session?.user?.id) {
      showMessage('error', 'Erro de autenticação. Faça login novamente.')
      return
    }

    try {
      setLoading(true)
      let successCount = 0
      let errorCount = 0

      for (const extracted of phrasesToCreate) {
        try {
          await frasesAPI.criar({
            phrase: extracted.phrase,
            author: extracted.author || 'Desconhecido',
            tags: extracted.tags,
            userId: session.user.id
          })
          successCount++
        } catch (error) {
          console.error('Erro ao criar frase:', error)
          errorCount++
        }
      }

      if (successCount > 0) {
        showMessage('success', `${successCount} frase(s) criada(s) com sucesso!`)
        loadPhrases()
      }
      
      if (errorCount > 0) {
        showMessage('error', `${errorCount} frase(s) falharam ao ser criada(s).`)
      }

      setIsExtractionModalOpen(false)
      setExtractionText('')
      setExtractedPhrases([])
      setSelectedExtractedPhrases(new Set())
    } catch (error) {
      console.error('Erro ao criar frases:', error)
      showMessage('error', 'Erro ao criar frases. Tente novamente.')
    } finally {
      setLoading(false)
    }
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

      const createdPhrase = await frasesAPI.criar(phraseToCreate)

      // Adicionar frase aos decks selecionados
      for (const deckId of createFormData.decks) {
        try {
          await decksAPI.adicionarFrase(deckId, createdPhrase.id)
        } catch (error) {
          console.error(`Erro ao adicionar frase ao deck ${deckId}:`, error)
        }
      }

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

  return (
    <div className={styles.container}>

      <Navigation onAddClick={openCreateModal} />

      <main className={styles.main}>
        {/* Logo no mobile */}
        <div className={styles.mobileLogo}>
          <Logo size="large" variant="secondary" />
        </div>
        
        {/* Input de pesquisa */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <input 
              type="text" 
              placeholder="Pesquise aqui" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} size={18} />
          </div>
          <div className={styles.searchActions}>
            <button 
              onClick={openCreateModal}
              className={styles.addButton}
              title="Adicionar frase"
            >
              Adicionar frase
            </button>
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={styles.filterButton}
              title="Filtros"
            >
              <Filter size={18} />
            </button>
          </div>
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
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  onClick={() => openModal(phrase)}
                  showActions={true}
                  showMetadata={true}
                />
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
                    <div className={styles.autocompleteContainer}>
                      <input
                        type="text"
                        value={editFormData.author}
                        onChange={(e) => handleEditAuthorChange(e.target.value)}
                        onFocus={() => {
                          // Verificar se uniqueAuthors está disponível
                          if (!uniqueAuthors || uniqueAuthors.length === 0) {
                            setEditAuthorSuggestions([])
                            setShowEditAuthorSuggestions(false)
                            return
                          }
                          
                          if (editFormData.author.trim()) {
                            const filtered = uniqueAuthors
                              .filter(author => author && author.trim() !== '')
                              .filter(author => 
                                author.toLowerCase().includes(editFormData.author.toLowerCase())
                              )
                              .slice(0, 20)
                            setEditAuthorSuggestions(filtered)
                            setShowEditAuthorSuggestions(filtered.length > 0)
                          } else {
                            // Se o campo estiver vazio, mostrar todos os autores (limitado a 20)
                            const suggestions = uniqueAuthors
                              .filter(author => author && author.trim() !== '')
                              .slice(0, 20)
                            setEditAuthorSuggestions(suggestions)
                            setShowEditAuthorSuggestions(suggestions.length > 0)
                          }
                        }}
                        onBlur={handleEditAuthorBlur}
                        className={styles.editInput}
                        placeholder="Digite ou selecione um autor"
                      />
                      {showEditAuthorSuggestions && editAuthorSuggestions.length > 0 && (
                        <div className={styles.autocompleteDropdown}>
                          {editAuthorSuggestions.map(author => (
                            <div 
                              key={author} 
                              className={styles.autocompleteItem}
                              onClick={() => handleSelectEditAuthor(author)}
                            >
                              {author}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  
                  <div className={styles.formGroup}>
                    <label>Tags:</label>
                    <div className={styles.tagManager}>
                      <div className={styles.tagInputRow}>
                        <input
                          type="text"
                          value={editTagInput}
                          onChange={(e) => setEditTagInput(e.target.value)}
                          onKeyDown={(event) => handleTagKeyDown(event, 'edit')}
                          className={styles.tagInputField}
                          placeholder="Digite e pressione Enter"
                        />
                        <button
                          type="button"
                          onClick={() => addTag(editTagInput, 'edit')}
                          className={styles.tagAddButton}
                        >
                          Adicionar
                        </button>
                      </div>

                      {editTagSuggestions.length > 0 && (
                        <div className={styles.tagSuggestions}>
                          {editTagSuggestions.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              className={styles.tagSuggestionItem}
                              onClick={() => addTag(tag, 'edit')}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      {editFormData.tags.length > 0 && (
                        <div className={styles.selectedTags}>
                          {editFormData.tags.map(tag => (
                            <span key={tag} className={styles.tagChip}>
                              {tag}
                              <button
                                type="button"
                                className={styles.tagRemoveButton}
                                onClick={() => removeTag(tag, 'edit')}
                                aria-label={`Remover tag ${tag}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Decks:</label>
                    <div className={styles.tagManager}>
                      <div className={styles.tagInputRow}>
                        <input
                          type="text"
                          value={editDeckInput}
                          onChange={(e) => setEditDeckInput(e.target.value)}
                          onKeyDown={(event) => handleDeckKeyDown(event, 'edit')}
                          className={styles.tagInputField}
                          placeholder="Digite o nome do deck"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeckAdd('edit')}
                          className={styles.tagAddButton}
                        >
                          Adicionar
                        </button>
                      </div>

                      {editDeckSuggestions.length > 0 && (
                        <div className={styles.tagSuggestions}>
                          {editDeckSuggestions.map(deck => (
                            <button
                              key={deck.id}
                              type="button"
                              className={styles.tagSuggestionItem}
                              onClick={() => addDeck(deck.id, 'edit')}
                            >
                              {deck.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {editFormData.decks.length > 0 && (
                        <div className={styles.selectedTags}>
                          {editFormData.decks.map(deckId => {
                            const deck = availableDecks.find(d => d.id === deckId)
                            return deck ? (
                              <span key={deckId} className={styles.tagChip}>
                                {deck.name}
                                <button
                                  type="button"
                                  className={styles.tagRemoveButton}
                                  onClick={() => removeDeck(deckId, 'edit')}
                                  aria-label={`Remover deck ${deck.name}`}
                                >
                                  ×
                                </button>
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
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
                    <Edit size={18} />
                    Editar
                  </button>
                  <button onClick={handleDelete} className={styles.deleteButton}>
                    <Trash2 size={18} />
                    Excluir
                  </button>
                  <button onClick={closeModal} className={styles.cancelButton}>
                    <X size={18} />
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
              <button
                onClick={() => {
                  setIsExtractionModalOpen(true)
                  setIsCreateModalOpen(false)
                }}
                className={styles.aiExtractButton}
                title="Extrair frases de texto com IA"
              >
                <Sparkles size={18} />
                Extrair com IA
              </button>
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
                        // Verificar se uniqueAuthors está disponível
                        if (!uniqueAuthors || uniqueAuthors.length === 0) {
                          setAuthorSuggestions([])
                          setShowAuthorSuggestions(false)
                          return
                        }
                        
                        if (createFormData.author.trim()) {
                          const filtered = uniqueAuthors
                            .filter(author => author && author.trim() !== '')
                            .filter(author => 
                              author.toLowerCase().includes(createFormData.author.toLowerCase())
                            )
                            .slice(0, 20)
                          setAuthorSuggestions(filtered)
                          setShowAuthorSuggestions(filtered.length > 0)
                        } else {
                          // Se o campo estiver vazio, mostrar todos os autores (limitado a 20)
                          const suggestions = uniqueAuthors
                            .filter(author => author && author.trim() !== '')
                            .slice(0, 20)
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
                  <label>Tags:</label>
                  <div className={styles.tagManager}>
                    <div className={styles.tagInputRow}>
                      <input
                        type="text"
                        value={createTagInput}
                        onChange={(e) => setCreateTagInput(e.target.value)}
                        onKeyDown={(event) => handleTagKeyDown(event, 'create')}
                        className={styles.tagInputField}
                        placeholder="Digite e pressione Enter"
                      />
                      <button
                        type="button"
                        onClick={() => addTag(createTagInput, 'create')}
                        className={styles.tagAddButton}
                      >
                        Adicionar
                      </button>
                    </div>

                    {createTagSuggestions.length > 0 && (
                      <div className={styles.tagSuggestions}>
                        {createTagSuggestions.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            className={styles.tagSuggestionItem}
                            onClick={() => addTag(tag, 'create')}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {createFormData.tags.length > 0 && (
                      <div className={styles.selectedTags}>
                        {createFormData.tags.map(tag => (
                          <span key={tag} className={styles.tagChip}>
                            {tag}
                            <button
                              type="button"
                              className={styles.tagRemoveButton}
                              onClick={() => removeTag(tag, 'create')}
                              aria-label={`Remover tag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Decks:</label>
                  <div className={styles.tagManager}>
                    <div className={styles.tagInputRow}>
                      <input
                        type="text"
                        value={createDeckInput}
                        onChange={(e) => setCreateDeckInput(e.target.value)}
                        onKeyDown={(event) => handleDeckKeyDown(event, 'create')}
                        className={styles.tagInputField}
                        placeholder="Digite o nome do deck"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeckAdd('create')}
                        className={styles.tagAddButton}
                      >
                        Adicionar
                      </button>
                    </div>

                    {createDeckSuggestions.length > 0 && (
                      <div className={styles.tagSuggestions}>
                        {createDeckSuggestions.map(deck => (
                          <button
                            key={deck.id}
                            type="button"
                            className={styles.tagSuggestionItem}
                            onClick={() => addDeck(deck.id, 'create')}
                          >
                            {deck.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {createFormData.decks.length > 0 && (
                      <div className={styles.selectedTags}>
                        {createFormData.decks.map(deckId => {
                          const deck = availableDecks.find(d => d.id === deckId)
                          return deck ? (
                            <span key={deckId} className={styles.tagChip}>
                              {deck.name}
                              <button
                                type="button"
                                className={styles.tagRemoveButton}
                                onClick={() => removeDeck(deckId, 'create')}
                                aria-label={`Remover deck ${deck.name}`}
                              >
                                ×
                              </button>
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
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

      {/* Modal de filtros */}
      {isFilterModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFilterModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Filtros</h2>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Autor:</label>
                  <select 
                    name="authorSelect" 
                    id="authorSelect"
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todos os autores</option>
                    {uniqueAuthors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Tag:</label>
                  <select 
                    name="tagSelect" 
                    id="tagSelect"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">Todas as tags</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button onClick={() => setIsFilterModalOpen(false)} className={styles.saveButton}>
                Aplicar Filtros
              </button>
              <button 
                onClick={() => {
                  setSelectedAuthor('all')
                  setSelectedTag('all')
                  setIsFilterModalOpen(false)
                }} 
                className={styles.cancelButton}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de extração de frases com IA */}
      {isExtractionModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsExtractionModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Extrair Frases com IA</h2>
              <button
                onClick={() => setIsExtractionModalOpen(false)}
                className={styles.closeButton}
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>Cole o texto aqui (mínimo 50 caracteres):</label>
                  <textarea
                    value={extractionText}
                    onChange={(e) => setExtractionText(e.target.value)}
                    className={styles.editTextarea}
                    rows={8}
                    placeholder="Cole um texto longo de um artigo, livro, ou qualquer conteúdo. A IA irá extrair as frases mais relevantes e memoráveis..."
                    disabled={isExtracting}
                  />
                  <div className={styles.textInfo}>
                    {extractionText.length} caracteres
                    {extractionText.length < 50 && (
                      <span className={styles.warningText}> (mínimo 50 caracteres)</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleExtractPhrases}
                  disabled={isExtracting || extractionText.length < 50}
                  className={styles.extractButton}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 size={18} className={styles.spinning} />
                      Extraindo...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Extrair Frases
                    </>
                  )}
                </button>

                {extractedPhrases.length > 0 && (
                  <div className={styles.extractedPhrasesContainer}>
                    <h3 className={styles.extractedTitle}>
                      {extractedPhrases.length} frase(s) encontrada(s)
                    </h3>
                    <div className={styles.extractedPhrasesList}>
                      {extractedPhrases.map((extracted, index) => (
                        <div
                          key={index}
                          className={`${styles.extractedPhraseCard} ${
                            selectedExtractedPhrases.has(index) ? styles.selected : ''
                          }`}
                          onClick={() => toggleSelectExtractedPhrase(index)}
                        >
                          <div className={styles.extractedPhraseHeader}>
                            <input
                              type="checkbox"
                              checked={selectedExtractedPhrases.has(index)}
                              onChange={() => toggleSelectExtractedPhrase(index)}
                              className={styles.checkbox}
                            />
                            <span className={styles.confidenceBadge}>
                              {Math.round(extracted.confidence * 100)}% confiança
                            </span>
                          </div>
                          <p className={styles.extractedPhraseText}>&quot;{extracted.phrase}&quot;</p>
                          {extracted.author && (
                            <p className={styles.extractedAuthor}>— {extracted.author}</p>
                          )}
                          {extracted.tags.length > 0 && (
                            <div className={styles.extractedTags}>
                              {extracted.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className={styles.extractedTag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {extracted.context && (
                            <p className={styles.extractedContext}>{extracted.context}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.modalActions}>
              {extractedPhrases.length > 0 && selectedExtractedPhrases.size > 0 && (
                <button
                  onClick={handleImportSelectedPhrases}
                  className={styles.saveButton}
                >
                  Importar {selectedExtractedPhrases.size} frase(s) selecionada(s)
                </button>
              )}
              <button
                onClick={() => {
                  setIsExtractionModalOpen(false)
                  setExtractionText('')
                  setExtractedPhrases([])
                  setSelectedExtractedPhrases(new Set())
                }}
                className={styles.cancelButton}
              >
                {extractedPhrases.length > 0 ? 'Fechar' : 'Cancelar'}
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
