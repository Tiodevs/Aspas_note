'use client'

import { Navigation } from '@/components/ui'
import styles from './page.module.css'

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <Navigation />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <h1>Sobre o Aspas Note</h1>
          <p>
            O Aspas Note é uma aplicação para gerenciar e organizar suas frases favoritas.
            Aqui você pode salvar citações inspiradoras, pensamentos marcantes e 
            reflexões importantes de uma forma simples e organizada.
          </p>
          
          <h2>Funcionalidades</h2>
          <ul>
            <li>Salvar frases com autor e tags</li>
            <li>Pesquisar por conteúdo, autor ou tags</li>
            <li>Organizar suas frases de forma intuitiva</li>
            <li>Interface moderna e responsiva</li>
          </ul>
          
          <p>
            Para acessar todas as funcionalidades, faça login ou crie sua conta.
          </p>
        </div>
      </main>
    </div>
  )
}
