'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Navigation } from '@/components/ui'
import { reviewsAPI, ReviewQueueItem, Grade } from '@/lib/api'
import styles from './page.module.css'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function StudyDeckPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const deckId = params?.deckId as string

  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const loadQueue = useCallback(async () => {
    if (!deckId || status !== 'authenticated') return

    setLoading(true)
    try {
      const response = await reviewsAPI.obterFila(deckId, 50)
      setQueue(response.queue)
      if (response.queue.length === 0) {
        setCompleted(true)
      }
    } catch (error) {
      console.error('Erro ao carregar fila:', error)
    } finally {
      setLoading(false)
    }
  }, [deckId, status])

  useEffect(() => {
    if (status === 'authenticated' && deckId) {
      loadQueue()
    }
  }, [status, deckId, loadQueue])

  const handleGrade = async (grade: Grade) => {
    if (isProcessing || !queue[currentIndex]) return

    setIsProcessing(true)
    try {
      await reviewsAPI.processarRevisao(queue[currentIndex].cardId, grade)
      
      // Avançar para próximo card
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setIsFlipped(false)
      } else {
        setCompleted(true)
      }
    } catch (error: any) {
      console.error('Erro ao processar revisão:', error)
      alert(error.message || 'Erro ao processar revisão')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentCard = queue[currentIndex]

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    )
  }

  if (completed || queue.length === 0) {
    return (
      <div className={styles.container}>
        <Navigation />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.completedState}>
              <CheckCircle size={64} className={styles.completedIcon} />
              <h2 className={styles.completedTitle}>Parabéns!</h2>
              <p className={styles.completedText}>
                Você revisou todos os cartões disponíveis.
              </p>
              <div className={styles.completedActions}>
          <Link href={`/games/spaced-repetition/${deckId}/edit`} className={styles.backLink}>
            <ArrowLeft size={20} />
            Voltar ao Baralho
          </Link>
                <Link href="/games/spaced-repetition" className={styles.dashboardLink}>
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <Link href={`/games/spaced-repetition`} className={styles.backButton}>
            <ArrowLeft size={20} />
            Voltar
          </Link>

          <div className={styles.header}>
            <h2 className={styles.deckName}>{currentCard.deckName}</h2>
            <div className={styles.progress}>
              {currentIndex + 1} / {queue.length}
            </div>
          </div>

          <div className={styles.cardContainer}>
            <div 
              className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
              onClick={() => !isFlipped && setIsFlipped(true)}
            >
              {!isFlipped ? (
                <div className={styles.cardFront}>
                  <p className={styles.phrase}>{currentCard.phrase}</p>
                  <p className={styles.hint}>Clique para ver a resposta</p>
                </div>
              ) : (
                <div className={styles.cardBack}>
                  <p className={styles.phrase}>{currentCard.phrase}</p>
                  <p className={styles.author}>— {currentCard.author}</p>
                  {currentCard.tags.length > 0 && (
                    <div className={styles.tags}>
                      {currentCard.tags.map(tag => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className={styles.gradeButtons}>
                    <button 
                      onClick={() => handleGrade('AGAIN')}
                      disabled={isProcessing}
                      className={styles.gradeButtonAgain}
                    >
                      Errei
                    </button>
                    <button 
                      onClick={() => handleGrade('HARD')}
                      disabled={isProcessing}
                      className={styles.gradeButtonHard}
                    >
                      Difícil
                    </button>
                    <button 
                      onClick={() => handleGrade('GOOD')}
                      disabled={isProcessing}
                      className={styles.gradeButtonGood}
                    >
                      Bom
                    </button>
                    <button 
                      onClick={() => handleGrade('EASY')}
                      disabled={isProcessing}
                      className={styles.gradeButtonEasy}
                    >
                      Fácil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

