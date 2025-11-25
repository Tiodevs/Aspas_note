'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Logo } from './Logo'
import styles from './Navigation.module.css'
import { signOut } from 'next-auth/react'
import { Github, LogIn, Home, User, LogOut, Plus, Brain } from 'lucide-react'

interface NavigationProps {
  onAddClick?: () => void
}


export default function Navigation({ onAddClick }: NavigationProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Se ainda está carregando, não renderizar nada
  if (status === 'loading') {
    return null
  }

  const handleSignOut = () => {
    signOut()
  }

  const isAuthenticated = !!session

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <Logo size="medium" variant="secondary" />

        <div className={styles.navIcons}>

          {!isAuthenticated && (
            <>
              
              <a
                className={`${styles.navIconText} ${pathname === '/github' ? styles.navIconActive : ''}`}
                title="Github"
                href="https://github.com/Tiodevs/AspasNote_Frontend"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repo
                <Github size={20} />
              </a>

              <Link
                className={`${styles.navIconText} ${pathname === '/login' ? styles.navIconActive : ''}`}
                title="Login"
                href="/login"
              >
                Login
                <LogIn size={20} />
              </Link>

            </>
          )}

          {/* Ícones apenas para usuários autenticados */}
          {isAuthenticated && (
            <>
              <Link
                className={`${styles.navIcon} ${pathname === '/dashboard' ? styles.navIconActive : ''}`}
                title="Home"
                href="/dashboard"
              >
                <Home size={20} />
              </Link>
              <Link
                className={`${styles.navIcon} ${pathname === '/games' ? styles.navIconActive : ''}`}
                title="Jogos"
                href="/games"
              >
                <Brain size={20} />
              </Link>
              <Link
                className={`${styles.navIcon} ${pathname === '/profile' ? styles.navIconActive : ''}`}
                title="Perfil"
                href="/profile"
              >
                <User size={20} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
