'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Navigation } from '@/components/ui'
import styles from './page.module.css'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loading}>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.content}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.comingSoon}>Esta página está em desenvolvimento e será implementada em breve.</p>
        <button 
          className={styles.backButton}
          onClick={() => router.back()}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

