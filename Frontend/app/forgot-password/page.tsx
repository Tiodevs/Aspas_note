'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import { Instagram, Linkedin } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao solicitar recuperação de senha')
      }

      await response.json()
      setSuccess(true)
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Left Side - Hero Card */}
      <div className={styles.leftSide}>
        <Image
          src="/images/backgrounds/CapaAuth.png"
          alt="Background"
          fill
          className={styles.backgroundImage}
          priority
        />

        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <div className={styles.logo}>
              <Image
                src="/images/logos/Logo.png"
                alt="Aspas Logo"
                width={120}
                height={40}
                className={styles.logoImage}
              />
            </div>

            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialIcon}>
                <Instagram size={18} />
              </a>
              <a href="#" className={styles.socialIcon}>
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className={styles.heroFooter}>
            <h2 className={styles.heroTitle}>Salve. Revise. Domine.</h2>
            <div className={styles.heroSubtitle}>Projeto de Portfólio</div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            {/* Mobile Logo (Visible only on mobile) */}
            <div className={styles.logoMobile}>
              <Image
                src="/images/logos/Logo.png"
                alt="Aspas Logo"
                width={140}
                height={45}
                className={styles.logoImage}
              />
            </div>

            <h1 className={styles.title}>Recuperar senha</h1>
            <p className={styles.subtitle}>
              Digite seu email para receber instruções de recuperação de senha.
            </p>
          </div>

          {success ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg className={styles.successIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className={styles.successTitle}>Email enviado!</h2>
              <p className={styles.successText}>
                Se esse email estiver cadastrado, você receberá instruções para recuperar sua senha.
              </p>
              <p className={styles.successSubtext}>
                Você será redirecionado para a página de login em instantes...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>
          )}

          <div className={styles.backToLogin}>
            <Link href="/login" className={styles.backLink}>
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

