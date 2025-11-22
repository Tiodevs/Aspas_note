import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'google'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props 
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      className={buttonClass}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          {typeof children === 'string' ? 'Carregando...' : children}
        </div>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
