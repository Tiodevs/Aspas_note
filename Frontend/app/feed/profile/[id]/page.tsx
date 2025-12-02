'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Navigation, Logo, PhraseCard } from '@/components/ui'
import { profileAPI, Profile, frasesAPI, Phrase } from '@/lib/api'
import styles from './page.module.css'
import { LucideUser } from 'lucide-react'

export default function PublicProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowingLoading, setIsFollowingLoading] = useState(false)
  const [phrasesCount, setPhrasesCount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Verificar se está seguindo o usuário
  const checkFollowingStatus = useCallback(async () => {
    // Não verificar se for o próprio perfil
    if (!session?.user?.id || !profile?.id || session.user.id === userId) {
      setIsFollowing(false)
      return
    }

    try {
      // Buscar quem o usuário logado está seguindo
      const following = await profileAPI.getFollowing(session.user.id)
      
      console.log('Verificando status de seguir:', {
        followingCount: following?.length,
        currentProfileId: profile.id,
        following: following?.map((f: { id: string; userId: string }) => ({ id: f.id, userId: f.userId }))
      })
      
      // Verificar se o profileId do perfil atual está na lista de perfis seguidos
      // A relação Follow é entre profiles (profileId), não entre users (userId)
      const isFollowingUser = Array.isArray(following) && following.some(
        (followed: { id: string }) => {
          // Comparar profileId (id do perfil seguido) com profileId do perfil atual
          const followedProfileId = String(followed.id || '')
          const targetProfileId = String(profile.id)
          const matches = followedProfileId === targetProfileId
          
          if (matches) {
            console.log('Match encontrado:', { followedProfileId, targetProfileId })
          }
          
          return matches
        }
      )
      
      console.log('Resultado da verificação:', { isFollowingUser, currentState: isFollowing })
      setIsFollowing(!!isFollowingUser)
    } catch (error) {
      console.error('Erro ao verificar status de seguir:', error)
      setIsFollowing(false)
    }
  }, [session?.user?.id, profile?.id, userId])

  useEffect(() => {
    const loadProfile = async () => {
      if (status !== 'authenticated' || !userId) return

      setLoading(true)
      setError(null)

      try {
        // Carregar perfil do usuário
        const profileData = await profileAPI.getByUserId(userId)
        setProfile(profileData)

        // Carregar frases do usuário
        try {
          const phrasesResponse = await frasesAPI.listarPorUsuario(userId)
          // listarPorUsuario retorna um array diretamente
          const phrasesArray = Array.isArray(phrasesResponse) ? phrasesResponse : []
          setPhrases(phrasesArray.slice(0, 4)) // Mostrar apenas as 4 primeiras
          setPhrasesCount(phrasesArray.length)
        } catch (phrasesErr) {
          console.error('Erro ao buscar frases:', phrasesErr)
          setPhrases([])
          setPhrasesCount(0)
        }

        // Verificar se está seguindo (após carregar o profile)
        // checkFollowingStatus será chamado quando profile mudar
      } catch (err: unknown) {
        console.error('Erro ao carregar perfil:', err)
        const error = err as { message?: string }
        if (error.message?.includes('404') || error.message?.includes('não encontrado')) {
          setError('Perfil não encontrado')
        } else {
          setError('Erro ao carregar perfil. Tente novamente.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && userId) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId, session?.user?.id])

  // Verificar status de seguir quando o profile for carregado
  useEffect(() => {
    if (profile?.id && session?.user?.id && session.user.id !== userId) {
      console.log('Verificando status de seguir ao carregar perfil...')
      checkFollowingStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, session?.user?.id, userId])

  const handleFollow = async () => {
    // Não permitir seguir o próprio perfil
    if (!session?.user?.id || !userId || !profile?.id || isFollowingLoading || session.user.id === userId) {
      return
    }

    setIsFollowingLoading(true)
    try {
      if (isFollowing) {
        await profileAPI.unfollow(userId)
        console.log('Unfollowing profile:', userId)
        setIsFollowing(false)
        // Atualizar contagem de seguidores
        if (profile) {
          setProfile({
            ...profile,
            followersCount: Math.max(0, profile.followersCount - 1)
          })
        }
      } else {
        try {
          await profileAPI.follow(userId)
          console.log('Following profile:', userId)
          setIsFollowing(true)
          // Atualizar contagem de seguidores
          if (profile) {
            setProfile({
              ...profile,
              followersCount: profile.followersCount + 1
            })
          }
        } catch (followError: unknown) {
          // Se o erro for 409 (já está seguindo), apenas atualizar o estado
          const error = followError as { message?: string; code?: string; status?: number }
          const errorMessage = error.message || ''
          const errorCode = error.code || ''
          const errorStatus = error.status || 0
          
          const isAlreadyFollowing = errorStatus === 409 || 
                                     errorCode === 'ALREADY_FOLLOWING' ||
                                     errorMessage.includes('409') || 
                                     errorMessage.includes('já está seguindo') ||
                                     errorMessage.includes('ALREADY_FOLLOWING')
          
          if (isAlreadyFollowing) {
            console.log('Já está seguindo este perfil, atualizando estado...', { errorCode, errorStatus })
            setIsFollowing(true)
            // Recarregar status do servidor para garantir sincronização
            await checkFollowingStatus()
            return
          }
          // Para outros erros, relançar
          throw followError
        }
      }
      // Recarregar o status para garantir sincronização
      await checkFollowingStatus()
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error)
      // Em caso de erro, recarregar o status do servidor
      await checkFollowingStatus()
    } finally {
      setIsFollowingLoading(false)
    }
  }

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

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button 
            onClick={() => router.push('/feed')}
            className={styles.backButton}
          >
            Voltar ao Feed
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>Perfil não encontrado</p>
        </div>
      </div>
    )
  }

  // Verificar se é o próprio perfil - comparar userId do parâmetro com userId da sessão
  const isOwnProfile = session?.user?.id && userId && session.user.id === userId

  return (
    <div className={styles.container}>
      <Navigation />

      <main className={styles.main}>
        {/* Logo no mobile */}
        <div className={styles.mobileLogo}>
          <Logo size="large" variant="secondary" />
        </div>
        
        {/* Seção do Perfil */}
        <div className={styles.profileSection}>
          <div className={styles.avatarContainer}>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.user.name || profile.user.username}
                className={styles.avatar}
              />
            ) : (
              <LucideUser size={100} className={styles.avatarIcon} />
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Seguindo</span>
              <span className={styles.statValue}>{profile.followingCount}</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Seguidores</span>
              <span className={styles.statValue}>{profile.followersCount}</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Frases</span>
              <span className={styles.statValue}>{phrasesCount}</span>
            </div>
          </div>

          {!isOwnProfile && (
            <button
              className={`${styles.followButton} ${isFollowing ? styles.followingButton : ''}`}
              onClick={handleFollow}
              disabled={isFollowingLoading}
            >
              {isFollowingLoading 
                ? 'Carregando...' 
                : isFollowing 
                  ? 'Seguindo' 
                  : 'Seguir'
              }
            </button>
          )}
        </div>

        {/* Seção de Frases */}
        {phrases.length > 0 && (
          <div className={styles.phrasesSection}>
            <div className={styles.phrasesContainer}>
              {phrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                />
              ))}
            </div>
          </div>
        )}

        {phrases.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Este usuário ainda não criou nenhuma frase.</p>
          </div>
        )}
      </main>
    </div>
  )
}

