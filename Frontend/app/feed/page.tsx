'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import styles from './page.module.css'
import { Navigation, PhraseCard } from '@/components/ui'
import { frasesAPI, PhraseWithUser } from '@/lib/api'

export default function FeedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phrases, setPhrases] = useState<PhraseWithUser[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const loadFeed = useCallback(async (page: number = 1) => {
    if (status !== 'authenticated' || !session?.user?.id) return

    setLoading(true)
    try {
      const response = await frasesAPI.getFeed(page, pagination.limit)
      setPhrases(response.phrases)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Erro ao carregar feed:', error)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [status, session?.user?.id, pagination.limit])

  useEffect(() => {
    if (status === 'authenticated') {
      loadFeed(1)
    }
  }, [status, loadFeed])

  const changePage = (newPage: number) => {
    loadFeed(newPage)
  }


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

        {loading && phrases.length === 0 ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : phrases.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Você ainda não está seguindo ninguém ou não há frases no feed.
            </p>
            <p className={styles.emptySubtext}>
              Comece a seguir pessoas para ver suas frases aqui!
            </p>
          </div>
        ) : (
          <>
            <div className={styles.phrasesContainer}>
              {phrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  showMetadata={true}
                  showActions={true}
                />
              ))}
            </div>

            {/* Paginação */}
            {pagination.pages > 1 && (
              <div className={styles.paginationContainer}>
                <button 
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
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
                  disabled={pagination.page === pagination.pages || loading}
                  className={styles.paginationButton}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

