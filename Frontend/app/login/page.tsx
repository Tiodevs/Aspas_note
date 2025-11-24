'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import { Instagram, Linkedin, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingCredentials(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        senha,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else {
        // Login bem-sucedido
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Erro interno do servidor')
    } finally {
      setIsLoadingCredentials(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true)
    setError('')

    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
      })
      // Nota: Não resetamos isLoadingGoogle aqui porque o signIn do Google
      // redireciona para o Google, então o componente será desmontado
    } catch {
      setError('Erro ao fazer login com Google')
      setIsLoadingGoogle(false)
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

      {/* Right Side - Login Form */}
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

            <h1 className={styles.title}>Entrar na conta</h1>
            <p className={styles.subtitle}>
              Você não tem uma conta?
              <Link href="/signup" className={styles.link}>Registrar-se</Link>
            </p>
          </div>

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
                disabled={isLoadingCredentials || isLoadingGoogle}
              />
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="senha" className={styles.label}>Senha</label>
                <Link href="#" className={styles.forgotPasswordLink}>
                  Recuperar a senha
                </Link>
              </div>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isLoadingCredentials || isLoadingGoogle}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoadingCredentials || isLoadingGoogle}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoadingCredentials || isLoadingGoogle}
            >
              {isLoadingCredentials ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Linha Divisora */}
          <div className={styles.divider}></div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            className={styles.googleButton}
            disabled={isLoadingCredentials || isLoadingGoogle}
          >
            <Image
              src="/images/icons/Google.png"
              alt="Google Icon"
              width={20}
              height={20}
              className={styles.googleIcon}
            />
            {isLoadingGoogle ? 'Redirecionando...' : 'Entrar com o Google'}
          </button>
        </div>
      </div>
    </div>
  )
}
