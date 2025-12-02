'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Navigation, Logo } from '@/components/ui'
import { decksAPI, reviewsAPI, Deck, ReviewStats } from '@/lib/api'
import styles from './page.module.css'
import { Plus, Search, Edit, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SpacedRepetitionDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [decks, setDecks] = useState<Deck[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const loadData = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) return

    setLoading(true)
    try {
      const [decksResponse, statsResponse] = await Promise.all([
        decksAPI.listar({ userId: session.user.id, limit: 50 }),
        reviewsAPI.obterEstatisticas()
      ])
      
      setDecks(decksResponse.decks)
      setStats(statsResponse)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [status, session?.user?.id])

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status, loadData])

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !createFormData.name.trim()) return

    setCreating(true)
    try {
      await decksAPI.criar({
        name: createFormData.name,
        description: createFormData.description || undefined,
        userId: session.user.id
      })
      
      setIsCreateModalOpen(false)
      setCreateFormData({ name: '', description: '' })
      loadData()
    } catch (error: unknown) {
      console.error('Erro ao criar baralho:', error)
      const err = error as { message?: string }
      alert(err.message || 'Erro ao criar baralho')
    } finally {
      setCreating(false)
    }
  }

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || initialLoading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        {/* Logo no mobile */}
        <div className={styles.mobileLogo}>
          <Logo size="large" variant="secondary" />
        </div>
        
        <div className={styles.content}>
          <Link href="/games" className={styles.backButton}>
            <ArrowLeft size={20} />
            Voltar para Jogos
          </Link>

          <h1 className={styles.title}>Repetição Espaçada</h1>

          {/* Estatísticas Gerais */}
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.totalCards}</div>
                <div className={styles.statLabel}>Total de Cartões</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.newCards}</div>
                <div className={styles.statLabel}>Novos</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.dueCards}</div>
                <div className={styles.statLabel}>Devidos Hoje</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.overdueCards}</div>
                <div className={styles.statLabel}>Atrasados</div>
              </div>
            </div>
          )}

          {/* Barra de Busca e Adicionar */}
          <div className={styles.actionsBar}>
            <div className={styles.searchContainer}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar baralhos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.addButton}
            >
              <Plus size={20} />
              Adicionar Baralho
            </button>
          </div>

          {/* Grid de Decks */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={64} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {searchTerm ? 'Nenhum baralho encontrado' : 'Você ainda não tem baralhos. Crie um para começar!'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className={styles.emptyButton}
                >
                  <Plus size={20} />
                  Criar Primeiro Baralho
                </button>
              )}
            </div>
          ) : (
            <div className={styles.decksGrid}>
              {filteredDecks.map((deck) => (
                <div key={deck.id} className={styles.deckCard}>
                  <h3 className={styles.deckName}>{deck.name}</h3>
                  {deck.description && (
                    <p className={styles.deckDescription}>{deck.description}</p>
                  )}
                  <div className={styles.deckStats}>
                    <BookOpen size={16} />
                    <span>{deck._count?.cards || 0} cartões</span>
                  </div>
                  <div className={styles.deckActions}>
                    <Link
                      href={`/games/spaced-repetition/${deck.id}/edit`}
                      className={styles.editButton}
                    >
                      <Edit size={16} />
                      Editar
                    </Link>
                    <Link
                      href={`/games/spaced-repetition/${deck.id}/study`}
                      className={styles.studyButton}
                    >
                      <BookOpen size={16} />
                      Estudar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Criar Deck */}
          {isCreateModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Criar Novo Baralho</h2>
                <form onSubmit={handleCreateDeck}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Nome do Baralho *</label>
                    <input
                      id="name"
                      type="text"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      placeholder="Ex: Filosofia, Literatura..."
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="description">Descrição (opcional)</label>
                    <textarea
                      id="description"
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                      placeholder="Descreva o baralho..."
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className={styles.cancelButton}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !createFormData.name.trim()}
                      className={styles.submitButton}
                    >
                      {creating ? 'Criando...' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

