'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Input, Button, Logo } from '@/components/ui'
import styles from './page.module.css'
import { Instagram, Linkedin, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações básicas
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          role: 'FREE' // Padrão para novos usuários
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar conta')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro interno do servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
      })
    } catch {
      setError('Erro ao criar conta com Google')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.wrapper}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg className={styles.successIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className={styles.successTitle}>
              Conta criada com sucesso!
            </h1>
            <p className={styles.successSubtitle}>
              Você será redirecionado para a página de login em instantes...
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressBarInner}></div>
            </div>
          </div>
        </div>
      </div>
    )
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

      {/* Right Side - Signup Form */}
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

            <h1 className={styles.title}>Criar uma conta</h1>
            <p className={styles.subtitle}>
              Você já tem uma conta?
              <Link href="/login" className={styles.link}>Entrar</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="nome" className={styles.label}>Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                className={styles.input}
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="senha" className={styles.label}>Senha</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <p className={styles.hint}>Mínimo 6 caracteres</p>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* Linha Divisora */}
          <div className={styles.divider}></div>

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignUp}
            className={styles.googleButton}
            disabled={isLoading}
          >
            <Image
              src="/images/icons/Google.png"
              alt="Google Icon"
              width={20}
              height={20}
              className={styles.googleIcon}
            />
            Continuar com o Google
          </button>
        </div>
      </div>
    </div>
  )
}
