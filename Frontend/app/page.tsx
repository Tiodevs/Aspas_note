'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import styles from './page.module.css'
import { motion } from 'framer-motion'
import { Search, Brain, Layers, Github } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 20,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 50,
      damping: 20,
    },
  },
  hover: {
    y: -8,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
}

export default function Home() {
  const { status } = useSession()

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

      <main className={styles.main}>
        {/* Hero Section - Split Layout */}
        <section className={styles.heroContent}>
          {/* Left Column: Text */}
          <motion.div
            className={styles.heroText}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.span className={styles.badge} variants={itemVariants}>
              Projeto de Portfólio
            </motion.span>

            <motion.h1 className={styles.title} variants={itemVariants}>
              Mantenha o Essencial,
              <br />
              <span className={styles.titleHighlight}>Sempre na Mente.</span>
            </motion.h1>

            <motion.p className={styles.description} variants={itemVariants}>
              Transforme suas anotações em sabedoria. Use nosso sistema inteligente de revisão para que as palavras certas
              estejam sempre na ponta da língua.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                className={styles.ctaButton}
                href={isAuthenticated ? '/phrases' : '/signup'}
              >
                Começar agora
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual */}
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
          >
            <div className={styles.cardStack}>
              {/* Floating Card 1 */}
              <div className={`${styles.glassCard} ${styles.card1}`}>
                <div className={styles.cardIcon}>
                  <Brain size={20} />
                </div>
                <div className={styles.cardLine} />
                <div className={`${styles.cardLine} ${styles.short}`} />
              </div>

              {/* Floating Card 2 */}
              <div className={`${styles.glassCard} ${styles.card2}`}>
                <div className={styles.cardIcon}>
                  <Search size={20} />
                </div>
                <div className={styles.cardLine} />
                <div className={`${styles.cardLine} ${styles.short}`} />
                <div className={styles.cardLine} />
              </div>

              {/* Floating Card 3 */}
              <div className={`${styles.glassCard} ${styles.card3}`}>
                <div className={styles.cardIcon}>
                  <Layers size={20} />
                </div>
                <div className={styles.cardLine} />
                <div className={`${styles.cardLine} ${styles.short}`} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefitsSection}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.sectionTitle}>Você se identifica?</h2>
            <p className={styles.sectionSubtitle}>
              Eu sempre anotava frases inspiradoras em palestras e reuniões, mas elas ficavam perdidas no meio de outras
              anotações.
            </p>
          </motion.div>

          <motion.div
            className={styles.benefitsGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.article className={styles.benefitCard} variants={cardVariants} whileHover="hover">
              <span className={styles.benefitIcon} aria-hidden="true">
                <Search size={28} strokeWidth={1.5} />
              </span>
              <h3>Busca Instantânea</h3>
              <p>
                Encontre qualquer frase em segundos, não importa quantas você tenha salvo.
              </p>
            </motion.article>

            <motion.article className={styles.benefitCard} variants={cardVariants} whileHover="hover">
              <span className={styles.benefitIcon} aria-hidden="true">
                <Brain size={28} strokeWidth={1.5} />
              </span>
              <h3>Memorização Ativa</h3>
              <p>
                Com nosso sistema de cards (estilo Anki), você pratica e realmente domina suas frases.
              </p>
            </motion.article>

            <motion.article className={styles.benefitCard} variants={cardVariants} whileHover="hover">
              <span className={styles.benefitIcon} aria-hidden="true">
                <Layers size={28} strokeWidth={1.5} />
              </span>
              <h3>Organização Inteligente</h3>
              <p>
                Organize e filtre por autor, tema ou tags. Tudo em seu devido lugar.
              </p>
            </motion.article>
          </motion.div>
        </section>

        {/* Project Section */}
        <motion.section
          className={styles.projectSection}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.sectionTitle}>Projeto de Portfólio</h2>
          <p className={styles.sectionSubtitle}>
            Este é um projeto pessoal desenvolvido para demonstrar minhas habilidades em desenvolvimento web. O código é
            open source e está disponível no GitHub.
          </p>

          <div className={styles.techChips}>
            {['Next.js', 'TypeScript', 'Node', 'Prisma', 'Supabase', 'Railway'].map((tech, index) => (
              <motion.span
                key={tech}
                className={`${styles.techChip} ${tech === 'Node' ? styles.techChipActive : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              className={styles.githubButton}
              href="https://github.com/seu-usuario/aspas-note"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver o Github
              <Github size={20} />
            </Link>
          </motion.div>
        </motion.section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Aspas. Todos os direitos reservados.
          </div>
          <div className={styles.footerLinks}>
            <Link href="mailto:santospefelipe@gmail.com" className={styles.footerLink}>santospefelipe@gmail.com</Link>
            <Link href="https://github.com/seu-usuario/aspas-note" target="_blank" className={styles.footerLink}>GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
