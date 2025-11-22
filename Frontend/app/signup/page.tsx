'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Input, Button, Logo } from '@/components/ui'
import styles from './page.module.css'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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
      {/* Left Side - Background Image */}
      <div className={styles.leftSide}>
        <Image
          src="/images/backgrounds/CapaAuth.png"
          alt="Background"
          fill
          className={styles.backgroundImage}
          priority
        />
      </div>

      {/* Right Side - Signup Form */}
      <div className={styles.rightSide}>
        <div className={styles.formContainer}>
          {/* Logo */}
          <div className={styles.logoContainer}>
            <Logo size="large" />
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <Input
              id="nome"
              name="nome"
              type="text"
              label="Nome completo"
              required
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              disabled={isLoading}
            />

            <Input
              id="senha"
              name="senha"
              type="password"
              label="Senha"
              hint="Mínimo 6 caracteres"
              required
              value={formData.senha}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              minLength={6}
            />


            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Criar conta
            </Button>
          </form>

          {/* Linha Divisora */}
          <div className={styles.divider}></div>

          {/* Google Signup Button */}
          <Button
            onClick={handleGoogleSignUp}
            variant="google"
            loading={isLoading}
            icon={
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Continuar com Google
          </Button>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              <Link href="/login" className={styles.footerLink}>
                Já tem uma conta? Entre aqui →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
