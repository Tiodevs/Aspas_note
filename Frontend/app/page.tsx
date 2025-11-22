'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navigation } from '@/components/ui'
import styles from './page.module.css'

export default function Home() {
  const { data: session, status } = useSession()


  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  const isAuthenticated = status === 'authenticated'

  return (
    <div className={styles.container}>
      <Navigation />

      <main className={styles.main}>
        <section className={styles.heroContent}>
          <span className={styles.badge}>Projeto de Portfólio</span>
          <h1 className={styles.title}>
            Mantenha o Essencial,
            <span className={styles.titleHighlight}>Sempre na Mente.</span>
          </h1>
          <p className={styles.description}>
            Transforme suas anotações em sabedoria. Use nosso sistema inteligente de revisão para que as palavras certas
            estejam sempre na ponta da língua.
          </p>
          <Link
            className={styles.ctaButton}
            href={isAuthenticated ? '/dashboard' : '/auth/signin'}
          >
            Começar agora
          </Link>
        </section>

        <section className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>Você se identifica?</h2>
          <p className={styles.sectionSubtitle}>
            Eu sempre anotava frases inspiradoras em palestras e reuniões, mas elas ficavam perdidas no meio de outras
            anotações.
          </p>

          <div className={styles.benefitsGrid}>
            <article className={styles.benefitCard}>
              <span className={styles.benefitIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M12.25 21.5C17.0825 21.5 21 17.5825 21 12.75C21 7.91751 17.0825 4 12.25 4C7.41751 4 3.5 7.91751 3.5 12.75C3.5 17.5825 7.41751 21.5 12.25 21.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24.4998 24.9998L18.8123 19.3123"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3>Busca Instantânea</h3>
              <p>
                Encontre qualquer frase em segundos, não importa quantas você tenha salvo.
              </p>
            </article>

            <article className={styles.benefitCard}>
              <span className={styles.benefitIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M5.25 22.75L9.33333 18.6667L12.25 21.5833L17.5 16.3333M19.8333 10.5C19.8333 13.8995 17.1495 16.5833 13.75 16.5833C10.3505 16.5833 7.66667 13.8995 7.66667 10.5C7.66667 7.10051 10.3505 4.41667 13.75 4.41667C17.1495 4.41667 19.8333 7.10051 19.8333 10.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3>Memorização Ativa</h3>
              <p>
                Com nosso sistema de cards (estilo Anki), você pratica e realmente domina suas frases.
              </p>
            </article>

            <article className={styles.benefitCard}>
              <span className={styles.benefitIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M8.75 5.25H19.25C20.3546 5.25 21.25 6.14543 21.25 7.25V22.1667L14 18.0833L6.75 22.1667V7.25C6.75 6.14543 7.64543 5.25 8.75 5.25Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3>Organização Inteligente</h3>
              <p>
                Organize e filtre por autor, tema ou tags. Tudo em seu devido lugar.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.projectSection}>
          <h2 className={styles.sectionTitle}>Projeto de Portfólio</h2>
          <p className={styles.sectionSubtitle}>
            Este é um projeto pessoal desenvolvido para demonstrar minhas habilidades em desenvolvimento web. O código é
            open source e está disponível no GitHub.
          </p>

          <div className={styles.techChips}>
            {['Next.js', 'TypeScript', 'Node', 'Prisma', 'Supabase', 'Railway'].map((tech) => (
              <span
                key={tech}
                className={`${styles.techChip} ${tech === 'Node' ? styles.techChipActive : ''}`}
              >
                {tech}
              </span>
            ))}
          </div>

          <Link
            className={styles.githubButton}
            href="https://github.com/seu-usuario/aspas-note"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver o Github
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.19-3.37-1.19-.45-1.16-1.11-1.47-1.11-1.47-.91-.63.07-.62.07-.62 1 .07 1.52 1.03 1.52 1.03.9 1.52 2.36 1.08 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.91.68 1.84 0 1.33-.01 2.41-.01 2.74 0 .26.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        </section>
      </main>
    </div>
  )
}
