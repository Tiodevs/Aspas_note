'use client'

import Link from 'next/link'
import { Phrase, PhraseWithUser } from '@/lib/api'
import { Share2, Download } from 'lucide-react'
import styles from './PhraseCard.module.css'

interface PhraseCardProps {
  phrase: Phrase | PhraseWithUser
  onClick?: () => void
  showMetadata?: boolean
  showActions?: boolean
  className?: string
}

export function PhraseCard({ 
  phrase, 
  onClick, 
  showMetadata = false, 
  showActions = false,
  className = '' 
}: PhraseCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getUserDisplayName = (phrase: Phrase | PhraseWithUser) => {
    if ('user' in phrase) {
      return phrase.user.name || phrase.user.username
    }
    return null
  }

  const hasUser = 'user' in phrase

  return (
    <div 
      className={`${styles.phrasesCard} ${className}`}
      onClick={onClick}
    >
      <div className={styles.phraseContent}>
        <p className={styles.phraseText}>&ldquo;{phrase.phrase}&rdquo;</p>
        <p className={styles.phraseAuthor}>
          — <span className={styles.phraseAuthorName}>{phrase.author}</span>
        </p>
      </div>

      {(showMetadata || showActions) && (
        <div className={styles.cardFooter}>
          {showMetadata && hasUser && (
            <div className={styles.cardMetadata}>
              <Link 
                href={`/feed/profile/${phrase.user.id}`}
                className={styles.userLink}
                onClick={(e) => e.stopPropagation()}
              >
                <span className={styles.metadataText}>
                  {getUserDisplayName(phrase)} - {formatDate(phrase.createdAt)}
                </span>
              </Link>
            </div>
          )}

          {showActions && (
            <div className={styles.cardActions}>
              <button 
                className={styles.actionButton}
                title="Compartilhar"
                aria-label="Compartilhar frase"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar compartilhamento
                }}
              >
                <Share2 size={18} />
              </button>
              <button 
                className={styles.actionButton}
                title="Baixar"
                aria-label="Baixar frase"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: Implementar download
                }}
              >
                <Download size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

