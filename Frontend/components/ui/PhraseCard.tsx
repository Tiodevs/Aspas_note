'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Phrase, PhraseWithUser } from '@/lib/api'
import { Share2, Download, Copy, Twitter, MessageCircle, Facebook, X } from 'lucide-react'
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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const baseUrl = window.location.origin
    // Usar a página do feed como URL base, já que não há rota específica para frases individuais
    return `${baseUrl}/feed`
  }

  const getShareText = () => {
    return `"${phrase.phrase}" — ${phrase.author}`
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Aspas Note - Frase Inspiradora',
      text: getShareText(),
      url: getShareUrl()
    }

    // Tentar usar Web Share API (nativo)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        setShowShareMenu(false)
        return
      } catch (error) {
        // Usuário cancelou ou erro ao compartilhar
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error)
        }
        return
      }
    }

    // Se Web Share API não estiver disponível, mostrar menu
    setShowShareMenu(!showShareMenu)
  }

  const copyToClipboard = async (text: string, type: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(text)
      setShowShareMenu(false)
      
      // Feedback visual (opcional - você pode adicionar um toast aqui)
      const button = document.activeElement as HTMLElement
      const originalTitle = button.title
      button.title = type === 'link' ? 'Link copiado!' : 'Texto copiado!'
      setTimeout(() => {
        button.title = originalTitle
      }, 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    setShowShareMenu(false)
  }

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setShowShareMenu(false)
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
    setShowShareMenu(false)
  }

  const downloadPhraseAsPNG = async () => {
    try {
      // Cores do tema
      const colors = {
        background: '#0A0A0A',
        background2: '#121212',
        primary: '#01DEB2',
        primaryDark: '#009C7D',
        white: '#FFFFFF',
        subtitle: '#9E9E9E',
        border: '#3B3B3B'
      }

      // Configurações do canvas
      const padding = 80
      const maxWidth = 1200
      const lineHeight = 1.6
      const fontSize = 48
      const authorFontSize = 32
      const quoteSize = 60

      // Criar canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Configurar fonte
      ctx.font = `${fontSize}px 'Barlow', sans-serif`
      
      // Quebrar texto em linhas
      const words = phrase.phrase.split(' ')
      const lines: string[] = []
      let currentLine = ''

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth - padding * 2 && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      if (currentLine) {
        lines.push(currentLine)
      }

      // Calcular dimensões
      const textHeight = lines.length * fontSize * lineHeight
      const authorHeight = authorFontSize * 1.4
      const quoteHeight = quoteSize
      const totalHeight = padding * 2 + quoteHeight + textHeight + 40 + authorHeight + 60

      canvas.width = maxWidth
      canvas.height = totalHeight

      // Fundo gradiente
      const gradient = ctx.createLinearGradient(0, 0, maxWidth, totalHeight)
      gradient.addColorStop(0, colors.background)
      gradient.addColorStop(1, colors.background2)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, maxWidth, totalHeight)

      // Borda decorativa superior com gradiente
      const borderGradient = ctx.createLinearGradient(0, 0, maxWidth, 0)
      borderGradient.addColorStop(0, colors.primary)
      borderGradient.addColorStop(1, colors.primaryDark || colors.primary)
      ctx.fillStyle = borderGradient
      ctx.fillRect(0, 0, maxWidth, 4)

      // Aspas de abertura decorativas com sombra
      ctx.shadowColor = 'rgba(1, 222, 178, 0.3)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.fillStyle = colors.primary
      ctx.font = `bold ${quoteSize}px 'Barlow', sans-serif`
      ctx.fillText('"', padding, padding + quoteSize)
      ctx.shadowBlur = 0

      // Texto da frase com sombra sutil
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillStyle = colors.white
      ctx.font = `${fontSize}px 'Barlow', sans-serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      const startY = padding + quoteSize + 20
      lines.forEach((line, index) => {
        ctx.fillText(line, padding, startY + index * fontSize * lineHeight)
      })
      ctx.shadowBlur = 0

     

      // Autor
      ctx.fillStyle = colors.primary
      ctx.font = `600 ${authorFontSize}px 'Barlow', sans-serif`
      ctx.fillText('—', padding, totalHeight - padding - authorHeight + 10)

      ctx.fillStyle = colors.subtitle
      ctx.font = `${authorFontSize}px 'Barlow', sans-serif`
      const dashWidth = ctx.measureText('— ').width
      ctx.fillText(phrase.author, padding + dashWidth, totalHeight - padding - authorHeight + 10)

      // Logo/assinatura no canto inferior direito com opacidade
      ctx.globalAlpha = 0.6
      ctx.fillStyle = colors.primary
      ctx.font = `300 24px 'Barlow', sans-serif`
      ctx.textAlign = 'right'
      ctx.fillText('Aspas Note', maxWidth - padding, totalHeight - padding + 10)
      ctx.globalAlpha = 1.0

      // Converter para blob e fazer download
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `frase-${phrase.author.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Erro ao gerar PNG:', error)
    }
  }

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
              <div className={styles.shareContainer} ref={shareMenuRef}>
                <button 
                  className={styles.actionButton}
                  title="Compartilhar"
                  aria-label="Compartilhar frase"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                >
                  <Share2 size={18} />
                </button>
                {showShareMenu && (
                  <div className={styles.shareMenu}>
                    <button
                      className={styles.shareMenuItem}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(getShareUrl(), 'link')
                      }}
                    >
                      <Copy size={16} />
                      <span>Copiar link</span>
                    </button>
                    <button
                      className={styles.shareMenuItem}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(getShareText(), 'text')
                      }}
                    >
                      <Copy size={16} />
                      <span>Copiar texto</span>
                    </button>
                    <div className={styles.shareMenuDivider} />
                    <button
                      className={styles.shareMenuItem}
                      onClick={(e) => {
                        e.stopPropagation()
                        shareOnTwitter()
                      }}
                    >
                      <Twitter size={16} />
                      <span>Twitter/X</span>
                    </button>
                    <button
                      className={styles.shareMenuItem}
                      onClick={(e) => {
                        e.stopPropagation()
                        shareOnWhatsApp()
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      className={styles.shareMenuItem}
                      onClick={(e) => {
                        e.stopPropagation()
                        shareOnFacebook()
                      }}
                    >
                      <Facebook size={16} />
                      <span>Facebook</span>
                    </button>
                  </div>
                )}
              </div>
              <button 
                className={styles.actionButton}
                title="Baixar"
                aria-label="Baixar frase"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadPhraseAsPNG()
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

