import React from 'react'
import styles from './Form.module.css'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string
  subtitle?: string
  error?: string
  children: React.ReactNode
}

export const Form: React.FC<FormProps> = ({ 
  title,
  subtitle,
  error,
  children,
  className,
  ...props 
}) => {
  return (
    <div className={`${styles.formWrapper} ${className || ''}`}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form {...props} className={styles.form}>
        {children}
      </form>
    </div>
  )
}
