'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation, Logo } from '@/components/ui'
import { profileAPI, Profile, frasesAPI, MonthlyReport } from '@/lib/api'
import { Settings, ArrowUp, ArrowDown, LogOut } from 'lucide-react'
import styles from './page.module.css'
import { LucideUser } from 'lucide-react'

interface MonthlyReportItem {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [phrasesCount, setPhrasesCount] = useState(0)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportItem[]>([])
  const [reportLoading, setReportLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Função para formatar o relatório mensal
  const formatMonthlyReport = (report: MonthlyReport): MonthlyReportItem[] => {
    const formatChange = (change: number): string => {
      const sign = change >= 0 ? '+' : ''
      return `${sign}${change.toFixed(2)}%`
    }

    return [
      {
        title: 'Frases criadas',
        value: report.phrasesCreated.current,
        change: formatChange(report.phrasesCreated.change),
        isPositive: report.phrasesCreated.change >= 0
      },
      {
        title: 'Frases decoradas',
        value: report.phrasesMemorized.current,
        change: formatChange(report.phrasesMemorized.change),
        isPositive: report.phrasesMemorized.change >= 0
      },
      {
        title: 'Novos seguidores',
        value: report.newFollowers.current,
        change: formatChange(report.newFollowers.change),
        isPositive: report.newFollowers.change >= 0
      },
      {
        title: 'Curtidas',
        value: report.likes.current,
        change: formatChange(report.likes.change),
        isPositive: report.likes.change >= 0
      }
    ]
  }

  useEffect(() => {
    const loadProfile = async () => {
      if (status !== 'authenticated' || !session?.user?.id) return

      setLoading(true)
      setError(null)

      try {
        const profileData = await profileAPI.getMyProfile()
        setProfile(profileData)
        
        // Buscar contagem de frases do usuário
        try {
          const phrasesResponse = await frasesAPI.listar({ 
            userId: session.user.id,
            page: 1,
            limit: 1
          })
          setPhrasesCount(phrasesResponse.pagination.total)
        } catch (phrasesErr) {
          console.error('Erro ao buscar contagem de frases:', phrasesErr)
          // Se falhar, usar valor padrão
          setPhrasesCount(0)
        }

        // Buscar relatório mensal
        try {
          setReportLoading(true)
          const report = await profileAPI.getMonthlyReport()
          setMonthlyReport(formatMonthlyReport(report))
        } catch (reportErr) {
          console.error('Erro ao buscar relatório mensal:', reportErr)
          // Se falhar, usar valores padrão
          setMonthlyReport([
            {
              title: 'Frases criadas',
              value: 0,
              change: '0%',
              isPositive: true
            },
            {
              title: 'Frases decoradas',
              value: 0,
              change: '0%',
              isPositive: true
            },
            {
              title: 'Novos seguidores',
              value: 0,
              change: '0%',
              isPositive: true
            },
            {
              title: 'Curtidas',
              value: 0,
              change: '0%',
              isPositive: true
            }
          ])
        } finally {
          setReportLoading(false)
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
        setError('Erro ao carregar perfil. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, session?.user?.id])

  const handleSettingsClick = () => {
    // Navegar para página de configurações (será criada depois)
    router.push('/settings')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.loading}>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.error}>
          <p>Perfil não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.content}>

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
              <LucideUser size={100} className={styles.avatar2} />
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
        </div>

        {/* Botões de Ação */}
        <div className={styles.actionsSection}>
          <button 
            className={styles.settingsButton}
            onClick={handleSettingsClick}
          >
            <span>Configurações</span>
          </button>
          
          <button 
            className={styles.logoutButton}
            onClick={handleSignOut}
          >
            <span>Sair da Conta</span>
          </button>
        </div>

        {/* Relatório Mensal */}
        <div className={styles.reportSection}>
          <h2 className={styles.reportTitle}>Relatório Mensal</h2>
          
          <div className={styles.reportCards}>
            {monthlyReport.map((report, index) => (
              <div key={index} className={styles.reportCard}>
                <div className={styles.reportCardHeader}>
                  <h3 className={styles.reportCardTitle}>{report.title}</h3>
                </div>
                <div className={styles.reportCardBody}>
                  <div className={styles.reportCardValue}>{report.value}</div>
                  <div className={`${styles.reportCardChange} ${report.isPositive ? styles.positive : styles.negative}`}>
                    {report.isPositive ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    )}
                    <span>{report.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

