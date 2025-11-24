'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import { Instagram, Linkedin, Eye, EyeOff } from 'lucide-react'

// Interface para critérios de validação de senha
interface PasswordCriteria {
  minLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

// Função para validar senha
const validatePassword = (password: string): PasswordCriteria => {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  }
}

// Função para verificar se a senha atende todos os critérios
const isPasswordValid = (criteria: PasswordCriteria): boolean => {
  return Object.values(criteria).every(Boolean)
}

function ResetPasswordForm() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Token de recuperação não encontrado. Por favor, acesse o link enviado por email.')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handlePasswordChange = (value: string) => {
    setNovaSenha(value)
    setPasswordCriteria(validatePassword(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validações
    if (!token) {
      setError('Token de recuperação não encontrado')
      setIsLoading(false)
      return
    }

    const criteria = validatePassword(novaSenha)
    if (!isPasswordValid(criteria)) {
      setError('A senha não atende aos critérios de segurança. Verifique os requisitos abaixo.')
      setIsLoading(false)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          novaSenha,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao redefinir senha')
      }

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

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.rightSide}>
          <div className={styles.formContainer}>
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg className={styles.successIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className={styles.successTitle}>Senha redefinida com sucesso!</h2>
              <p className={styles.successText}>
                Sua senha foi atualizada. Você será redirecionado para a página de login em instantes...
              </p>
              <div className={styles.progressBar}>
                <div className={styles.progressBarInner}></div>
              </div>
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

      {/* Right Side - Reset Password Form */}
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

            <h1 className={styles.title}>Redefinir senha</h1>
            <p className={styles.subtitle}>
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="novaSenha" className={styles.label}>Nova senha</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="novaSenha"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  required
                  value={novaSenha}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  minLength={8}
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
              
              {/* Critérios de validação de senha */}
              {novaSenha && (
                <div className={styles.passwordCriteria}>
                  <div className={styles.criteriaItem}>
                    <span className={passwordCriteria.minLength ? styles.criteriaValid : styles.criteriaInvalid}>
                      {passwordCriteria.minLength ? '✓' : '✗'}
                    </span>
                    <span className={passwordCriteria.minLength ? styles.criteriaTextValid : styles.criteriaText}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <span className={passwordCriteria.hasUpperCase ? styles.criteriaValid : styles.criteriaInvalid}>
                      {passwordCriteria.hasUpperCase ? '✓' : '✗'}
                    </span>
                    <span className={passwordCriteria.hasUpperCase ? styles.criteriaTextValid : styles.criteriaText}>
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <span className={passwordCriteria.hasLowerCase ? styles.criteriaValid : styles.criteriaInvalid}>
                      {passwordCriteria.hasLowerCase ? '✓' : '✗'}
                    </span>
                    <span className={passwordCriteria.hasLowerCase ? styles.criteriaTextValid : styles.criteriaText}>
                      Uma letra minúscula
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <span className={passwordCriteria.hasNumber ? styles.criteriaValid : styles.criteriaInvalid}>
                      {passwordCriteria.hasNumber ? '✓' : '✗'}
                    </span>
                    <span className={passwordCriteria.hasNumber ? styles.criteriaTextValid : styles.criteriaText}>
                      Um número
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <span className={passwordCriteria.hasSpecialChar ? styles.criteriaValid : styles.criteriaInvalid}>
                      {passwordCriteria.hasSpecialChar ? '✓' : '✗'}
                    </span>
                    <span className={passwordCriteria.hasSpecialChar ? styles.criteriaTextValid : styles.criteriaText}>
                      Um caractere especial (!@#$%^&* etc.)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmarSenha" className={styles.label}>Confirmar senha</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={styles.input}
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? (
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
              disabled={isLoading}
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.rightSide}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1 className={styles.title}>Redefinir senha</h1>
              <p className={styles.subtitle}>Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
