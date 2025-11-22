import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  onHintClick?: () => void
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  hint, 
  onHintClick, 
  className,
  ...props 
}) => {
  return (
    <div className={styles.inputGroup}>
      <div className={styles.labelContainer}>
        <label htmlFor={props.id} className={styles.label}>
          {label}
        </label>
        {hint && (
          <span 
            className={styles.hint}
            onClick={onHintClick}
            role={onHintClick ? "button" : undefined}
            tabIndex={onHintClick ? 0 : undefined}
          >
            {hint}
          </span>
        )}
      </div>
      <input
        {...props}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
      />
      {error && (
        <span className={styles.errorText}>{error}</span>
      )}
    </div>
  )
}
