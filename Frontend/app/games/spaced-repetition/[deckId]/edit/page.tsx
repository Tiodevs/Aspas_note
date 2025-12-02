'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Navigation } from '@/components/ui'
import { decksAPI, reviewsAPI, Deck, Card, ReviewStats } from '@/lib/api'
import styles from './page.module.css'
import { ArrowLeft, Search, Plus, X, Trash2, Edit2, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditDeckPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const deckId = params?.deckId as string

  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const loadData = useCallback(async (page: number = 1) => {
    if (!deckId || status !== 'authenticated') return

    setLoading(true)
    try {
      const [deckResponse, cardsResponse, statsResponse] = await Promise.all([
        decksAPI.buscarPorId(deckId),
        decksAPI.listarCartoes(deckId, page, pagination.limit),
        reviewsAPI.obterEstatisticas(deckId)
      ])
      
      setDeck(deckResponse)
      setCards(cardsResponse.cards)
      setPagination(cardsResponse.pagination)
      setStats(statsResponse)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [deckId, status, pagination.limit])

  useEffect(() => {
    if (status === 'authenticated' && deckId) {
      loadData(1)
    }
  }, [status, deckId, loadData])

  const handleRemoveCard = async (cardId: string) => {
    if (!confirm('Tem certeza que deseja remover esta frase do baralho?')) return

    try {
      await decksAPI.removerFrase(cardId)
      loadData(pagination.page)
    } catch (error: unknown) {
      console.error('Erro ao remover frase:', error)
      const err = error as { message?: string }
      alert(err.message || 'Erro ao remover frase')
    }
  }

  const handleOpenEditModal = () => {
    if (deck) {
      setEditFormData({
        name: deck.name,
        description: deck.description || ''
      })
      setIsEditModalOpen(true)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deckId || !editFormData.name.trim()) return

    setIsSaving(true)
    try {
      await decksAPI.atualizar(deckId, {
        name: editFormData.name.trim(),
        description: editFormData.description.trim() || undefined
      })
      setIsEditModalOpen(false)
      loadData(pagination.page)
    } catch (error: unknown) {
      console.error('Erro ao atualizar baralho:', error)
      const err = error as { message?: string }
      alert(err.message || 'Erro ao atualizar baralho')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDeck = async () => {
    if (!deckId) return

    setIsDeleting(true)
    try {
      await decksAPI.deletar(deckId)
      router.push('/games/spaced-repetition')
    } catch (error: unknown) {
      console.error('Erro ao deletar baralho:', error)
      const err = error as { message?: string }
      alert(err.message || 'Erro ao deletar baralho')
      setIsDeleting(false)
    }
  }

  const filteredCards = cards.filter(card =>
    card.phrase?.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.phrase?.author.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!deck) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.errorState}>
          <p>Baralho não encontrado</p>
          <Link href="/games/spaced-repetition" className={styles.backLink}>
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <Link href="/games/spaced-repetition" className={styles.backButton}>
            <ArrowLeft size={20} />
            Voltar
          </Link>

          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div>
                <h1 className={styles.title}>{deck.name}</h1>
                {deck.description && (
                  <p className={styles.description}>{deck.description}</p>
                )}
              </div>
              <div className={styles.headerActions}>
                <button
                  onClick={handleOpenEditModal}
                  className={styles.editDeckButton}
                  title="Editar baralho"
                >
                  <Edit2 size={18} />
                  Editar
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className={styles.deleteDeckButton}
                  title="Deletar baralho"
                >
                  <Trash2 size={18} />
                  Deletar
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas do Deck */}
          {stats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.totalCards}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.newCards}</div>
                <div className={styles.statLabel}>Novos</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.dueCards}</div>
                <div className={styles.statLabel}>Devidos</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.overdueCards}</div>
                <div className={styles.statLabel}>Atrasados</div>
              </div>
            </div>
          )}

          {/* Busca */}
          <div className={styles.searchContainer}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar frases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Lista de Cards */}
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum cartão encontrado</p>
            </div>
          ) : (
            <>
              <div className={styles.cardsList}>
                {filteredCards.map((card) => (
                  <div key={card.id} className={styles.cardItem}>
                    <div className={styles.cardContent}>
                      <p className={styles.cardPhrase}>{card.phrase?.phrase}</p>
                      <p className={styles.cardAuthor}>— {card.phrase?.author}</p>
                      {card.phrase?.tags && card.phrase.tags.length > 0 && (
                        <div className={styles.cardTags}>
                          {card.phrase.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className={styles.cardMeta}>
                        <span>Repetições: {card.repetitions}</span>
                        <span>Próxima revisão: {new Date(card.nextReviewDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className={styles.removeButton}
                      title="Remover do baralho"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => loadData(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={styles.pageButton}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  <button
                    onClick={() => loadData(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className={styles.pageButton}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal de Editar Deck */}
          {isEditModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Editar Baralho</h2>
                <form onSubmit={handleSaveEdit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="editName">Nome do Baralho *</label>
                    <input
                      id="editName"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="Ex: Filosofia, Literatura..."
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="editDescription">Descrição (opcional)</label>
                    <textarea
                      id="editDescription"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Descreva o baralho..."
                      rows={3}
                      className={styles.formTextarea}
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className={styles.cancelButton}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !editFormData.name.trim()}
                      className={styles.submitButton}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Deletar Deck */}
          {isDeleteModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.modalTitle}>Deletar Baralho</h2>
                <p className={styles.deleteWarning}>
                  Tem certeza que deseja deletar o baralho <strong>&quot;{deck.name}&quot;</strong>?
                  <br />
                  Esta ação não pode ser desfeita e todos os cartões serão removidos.
                </p>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className={styles.cancelButton}
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDeck}
                    disabled={isDeleting}
                    className={styles.deleteButton}
                  >
                    {isDeleting ? 'Deletando...' : 'Deletar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

