'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/ui'
import styles from './page.module.css'
import { Brain, Lock } from 'lucide-react'

interface Game {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  available: boolean
  route: string
}

export default function GamesPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const games: Game[] = [
    {
      id: 'spaced-repetition',
      name: 'Repetição Espaçada',
      description: 'Estude e memorize frases usando o algoritmo SM-2 (Anki). Aprenda de forma eficiente com revisões espaçadas.',
      icon: <Brain size={48} />,
      available: true,
      route: '/games/spaced-repetition'
    },
    // Futuros jogos podem ser adicionados aqui
  ]

  if (status === 'loading') {
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
        <div className={styles.content}>
          <h1 className={styles.title}>Jogos</h1>
          <p className={styles.subtitle}>Escolha um jogo para começar a aprender</p>

          <div className={styles.gamesGrid}>
            {games.map((game) => (
              <div key={game.id} className={styles.gameCard}>
                <div className={styles.gameIcon}>
                  {game.icon}
                </div>
                <h2 className={styles.gameName}>{game.name}</h2>
                <p className={styles.gameDescription}>{game.description}</p>
                
                {game.available ? (
                  <Link href={game.route} className={styles.playButton}>
                    Jogar Agora
                  </Link>
                ) : (
                  <button className={styles.disabledButton} disabled>
                    <Lock size={16} />
                    Em Breve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

