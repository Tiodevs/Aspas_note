# 📚 Fluxo da Funcionalidade de Repetição Espaçada (Anki) - Frontend

## 🎯 Visão Geral

Este documento explica o fluxo completo de como o usuário interage com a funcionalidade de repetição espaçada no frontend, desde a criação de baralhos até a revisão das frases.

---

## 🔄 Fluxo Principal

### **0. Página de Jogos (Hub Central)**

```
Usuário → Menu "Jogos" ou "Games"
  ↓
GET /api/games (ou lista hardcoded inicialmente)
  ↓
Página exibe cards de jogos disponíveis:
  ┌─────────────────────────────────┐
  │  🎴 Repetição Espaçada (Anki)   │
  │                                 │
  │  Estude e memorize frases       │
  │  usando algoritmo SM-2          │
  │                                 │
  │      [Jogar Agora]              │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │  🎯 [Futuro] Outro Jogo         │
  │                                 │
  │  Descrição do próximo jogo...   │
  │                                 │
  │      [Em Breve]                 │
  └─────────────────────────────────┘
```

**Componente sugerido:** `app/games/page.tsx`

---

### **1. Entrar no Jogo de Repetição Espaçada**

#### 1.1. Página Principal do Jogo (Dashboard de Decks)
```
Usuário clica em "Jogar Agora" no card de Repetição Espaçada
  ↓
GET /api/reviews/stats (estatísticas gerais)
GET /api/decks?userId={userId}&page=1&limit=20
  ↓
Interface exibe:

┌─────────────────────────────────────────────────────────┐
│  📊 Relatórios Gerais                                   │
├─────────────────────────────────────────────────────────┤
│  [Total: 50] [Novos: 10] [Devidos: 15] [Atrasados: 5]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🔍 [Buscar] [Filtros ▼]  [+ Adicionar Baralho]        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  Filosofia           │  │  Literatura          │
│  25 cartões          │  │  30 cartões          │
│                      │  │                      │
│  [Editar] [Estudar]  │  │  [Editar] [Estudar]  │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│  Ciências            │  │  ...                 │
│  15 cartões          │  │                      │
│                      │  │                      │
│  [Editar] [Estudar]  │  │                      │
└──────────────────────┘  └──────────────────────┘
```

**Componente sugerido:** `app/games/spaced-repetition/page.tsx`

#### 1.2. Criar um Baralho
```
Usuário clica em "+ Adicionar Baralho"
  ↓
Modal/Dialog aparece:
  - Campo: Nome do baralho
  - Campo: Descrição (opcional)
  - Botão: Criar
  ↓
POST /api/decks { name, description, userId }
  ↓
Baralho criado → Modal fecha → Lista atualiza
  (ou redireciona para página de edição do deck)
```

#### 1.3. Editar Deck (Página de Gestão de Cards)
```
Usuário clica em "Editar" em um deck
  ↓
GET /api/decks/{deckId}
GET /api/decks/{deckId}/cards?page=1&limit=20
GET /api/reviews/stats?deckId={deckId}
  ↓
Página exibe:

┌─────────────────────────────────────────────────────────┐
│  ← Voltar    Filosofia                    [Salvar]      │
├─────────────────────────────────────────────────────────┤
│  📊 Estatísticas do Deck:                               │
│  Total: 25 | Novos: 5 | Devidos: 10 | Atrasados: 3     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [Buscar frases] [Filtros: Autor, Tags, Status ▼]      │
│  [+ Adicionar Frase]                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📝 Frase: "A vida só pode ser..."                      │
│  Autor: Kierkegaard | Tags: [filosofia, existência]     │
│  Status: Nova | Próxima revisão: Hoje                   │
│  [Remover do baralho]                                   │
├─────────────────────────────────────────────────────────┤
│  📝 Frase: "O tempo é relativo..."                      │
│  Autor: Einstein | Tags: [ciência]                      │
│  Status: Em progresso | Próxima revisão: 15/01/2025    │
│  [Remover do baralho]                                   │
└─────────────────────────────────────────────────────────┘

[< 1 2 3 ... 10 >]  (Paginação)
```

**Funcionalidades:**
- Editar nome/descrição do deck
- Ver estatísticas do deck
- Buscar/filtrar cards no deck
- Adicionar frases ao deck (modal com busca)
- Remover frases do deck
- Ver detalhes de cada card (status, próxima revisão, etc.)

**Componente sugerido:** `app/games/spaced-repetition/[deckId]/edit/page.tsx`

#### 1.4. Estudar Deck (Revisão Espaçada)
```
Usuário clica em "Estudar" em um deck
  ↓
GET /api/reviews/queue?deckId={deckId}&limit=20
  ↓
Página de revisão (veja seção 3)
```

---

### **2. Adicionar Frases aos Baralhos**

#### 2.1. Adicionar Frase Existente
```
Usuário está na página de detalhes do baralho
  ↓
Clica em "Adicionar Frase"
  ↓
Modal/Dialog com:
  - Busca de frases próprias
  - Lista de frases (com filtros)
  - Botão "Adicionar" em cada frase
  ↓
POST /api/decks/{deckId}/phrases { phraseId }
  ↓
Frase adicionada → Card criado com valores iniciais:
  - easinessFactor: 2.5
  - interval: 0
  - repetitions: 0
  - nextReviewDate: hoje
```

#### 2.2. Criar e Adicionar Frase Nova
```
Fluxo alternativo:
  ↓
Cria nova frase → POST /api/phrases
  ↓
Automaticamente oferece opção de adicionar a um baralho
  ↓
Seleciona baralho → POST /api/decks/{deckId}/phrases
```

---

### **2. Estudar Deck (Revisão Espaçada)**

#### 2.1. Acessar a Fila de Revisão
```
Usuário clica em "Estudar" no card do deck
  ↓
GET /api/reviews/queue?deckId={deckId}&limit=20
  ↓
Retorna fila ordenada por prioridade:
  1. Frases novas (nunca revisadas)
  2. Frases esquecidas (intervalo = 1 dia)
  3. Frases atrasadas (passou da data)
  4. Frases devidas (data é hoje)
```

#### 2.2. Interface de Revisão (Card Flip)
```
┌─────────────────────────────────────┐
│         Baralho: Filosofia          │
│   Progresso: 5/20                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                                     │
│  "A vida só pode ser compreendida   │
│   olhando para trás, mas deve ser   │
│   vivida olhando para frente."      │
│                                     │
│           - Søren Kierkegaard       │
│                                     │
│  [Clica para ver resposta]          │
│                                     │
└─────────────────────────────────────┘

Após clicar (flip do card):
┌─────────────────────────────────────┐
│                                     │
│  "A vida só pode ser compreendida   │
│   olhando para trás, mas deve ser   │
│   vivida olhando para frente."      │
│                                     │
│           - Søren Kierkegaard       │
│                                     │
│  [Como você foi?]                   │
│                                     │
│  [Errei] [Difícil] [Bom] [Fácil]   │
│                                     │
└─────────────────────────────────────┘
```

#### 2.3. Avaliar e Processar Revisão
```
Usuário clica em uma das 4 opções:
  1. Errei (AGAIN)
  2. Difícil (HARD)
  3. Bom (GOOD)
  4. Fácil (EASY)
  ↓
POST /api/reviews {
  cardId: "...",
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY",
  userId: "..."
}
  ↓
Backend processa com algoritmo SM-2:
  - Calcula novo E-Factor
  - Calcula novo intervalo
  - Atualiza repetições
  - Calcula próxima data de revisão
  ↓
Retorna: Card atualizado + Próxima data
  ↓
Frontend:
  - Mostra feedback visual
  - Remove card da fila atual
  - Carrega próximo card
  - Atualiza estatísticas
```

---

### **3. Adicionar Frases aos Baralhos**

#### 3.1. Adicionar Frase Existente (na Página de Edição)
```
Usuário está na página de edição do deck
  ↓
Clica em "+ Adicionar Frase"
  ↓
Modal/Dialog aparece com:
  - Busca de frases próprias
  - Filtros: Autor, Tags
  - Lista paginada de frases
  - Botão "Adicionar" em cada frase
  ↓
POST /api/decks/{deckId}/phrases { phraseId }
  ↓
Frase adicionada → Modal atualiza → Card criado no deck
```

#### 3.2. Criar e Adicionar Frase Nova
```
Fluxo alternativo:
  ↓
Na página de edição do deck → "Adicionar Frase" → "Criar Nova"
  ↓
Modal: Formulário de criar frase
  ↓
POST /api/phrases { phrase, author, tags, userId }
  ↓
Automaticamente adiciona ao deck atual:
  POST /api/decks/{deckId}/phrases { phraseId }
```

---

### **4. Visualizar Estatísticas**

#### 4.1. Estatísticas Gerais (no Dashboard)
```
GET /api/reviews/stats
  ↓
Retorna:
{
  totalCards: 50,
  newCards: 10,
  dueCards: 15,
  overdueCards: 5,
  gradeStats: {
    AGAIN: 20,
    HARD: 15,
    GOOD: 100,
    EASY: 50
  }
}
  ↓
Dashboard exibe:
  - Total de cartões
  - Cartões novos (para revisar)
  - Cartões devidos hoje
  - Cartões atrasados
  - Gráfico de performance
```

#### 4.2. Estatísticas por Baralho
```
GET /api/reviews/stats?deckId={deckId}
  ↓
Mesmas estatísticas, filtradas por baralho
```

---

## 🗂️ Estrutura de Páginas Sugerida

```
app/
├── games/
│   ├── page.tsx                                    # Hub de jogos
│   │
│   └── spaced-repetition/                         # Jogo de repetição espaçada
│       ├── page.tsx                               # Dashboard: Lista de decks + Estatísticas
│       │                                          # (com botões Adicionar, Filtrar, Pesquisar)
│       │
│       └── [deckId]/
│           ├── edit/
│           │   └── page.tsx                       # Editar deck: Gerenciar cards
│           │                                      # (com filtros, paginação, estatísticas)
│           │
│           └── study/
│               └── page.tsx                       # Estudar: Revisão espaçada (Anki)
│
└── [outros jogos futuros]/
    └── ...
```

---

## 🎨 Componentes Sugeridos

### **1. GameCard**
```tsx
interface GameCardProps {
  game: {
    id: string
    name: string
    description: string
    icon: string
    available: boolean
    route: string
  }
}
```
- Card de jogo no hub
- Exibe nome, descrição, ícone
- Botão: "Jogar Agora" ou "Em Breve"

### **2. StatsCards**
```tsx
interface StatsCardsProps {
  stats: ReviewStats
}
```
- Cards com estatísticas gerais
- Total, Novos, Devidos, Atrasados

### **3. DeckCard**
```tsx
interface DeckCardProps {
  deck: {
    id: string
    name: string
    description?: string
    _count: { cards: number }
  }
  onEdit: () => void
  onStudy: () => void
}
```
- Card de deck no dashboard
- Exibe nome, quantidade de cartões
- Botões: Editar, Estudar

### **4. DeckFilters**
```tsx
interface DeckFiltersProps {
  onFilter: (filters: DeckFilters) => void
  onSearch: (query: string) => void
}
```
- Barra de busca
- Filtros (dropdown)
- Botão adicionar deck

### **5. DeckEditCard**
```tsx
interface DeckEditCardProps {
  card: CardWithPhrase
  onRemove: (cardId: string) => void
}
```
- Card individual na página de edição
- Mostra frase, autor, tags, status
- Botão remover

### **6. ReviewCard**
```tsx
interface ReviewCardProps {
  card: ReviewQueueItem
  onGrade: (grade: Grade) => Promise<void>
}
```
- Card flip animação
- Mostra frase e autor
- Botões de avaliação (4 opções)

### **7. ReviewQueue**
```tsx
interface ReviewQueueProps {
  deckId: string
}
```
- Carrega fila de revisão
- Gerencia estado do card atual
- Controla progresso (X/Total)
- Feedback visual após avaliação

---

## 📡 Integração com API Existente

### Funções a adicionar em `lib/api.ts`:

```typescript
// Interfaces
export interface Deck {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
  _count?: { cards: number }
}

export interface Card {
  id: string
  phraseId: string
  deckId: string
  userId: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewedAt?: string
  phrase?: Phrase
  deck?: Deck
}

export interface ReviewQueueItem {
  cardId: string
  phraseId: string
  phrase: string
  author: string
  tags: string[]
  deckId: string
  deckName: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewedAt: string | null
  isNew: boolean
}

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

export interface ReviewStats {
  totalCards: number
  newCards: number
  dueCards: number
  overdueCards: number
  gradeStats: {
    AGAIN: number
    HARD: number
    GOOD: number
    EASY: number
  }
}

// Funções de API
export const decksAPI = {
  // Baralhos
  listar: (filters?: { userId?: string; page?: number; limit?: number }) =>
    apiClient.get('/decks', filters),
  
  buscarPorId: (id: string) =>
    apiClient.get(`/decks/${id}`),
  
  criar: (data: { name: string; description?: string; userId: string }) =>
    apiClient.post('/decks', data),
  
  atualizar: (id: string, data: { name?: string; description?: string }) =>
    apiClient.put(`/decks/${id}`, data),
  
  deletar: (id: string) =>
    apiClient.delete(`/decks/${id}`),
  
  // Cartões
  listarCartoes: (deckId: string, page?: number, limit?: number) =>
    apiClient.get(`/decks/${deckId}/cards`, { page, limit }),
  
  adicionarFrase: (deckId: string, phraseId: string) =>
    apiClient.post(`/decks/${deckId}/phrases`, { phraseId }),
  
  removerFrase: (cardId: string) =>
    apiClient.delete(`/decks/cards/${cardId}`),
}

export const reviewsAPI = {
  obterFila: (deckId?: string, limit?: number) =>
    apiClient.get('/reviews/queue', { deckId, limit }),
  
  processarRevisao: (cardId: string, grade: Grade) =>
    apiClient.post('/reviews', { cardId, grade }),
  
  obterEstatisticas: (deckId?: string) =>
    apiClient.get('/reviews/stats', deckId ? { deckId } : undefined),
}
```

---

## 🔄 Fluxo Completo Simplificado

### **Fluxo Principal:**

```
1. Usuário acessa Hub de Jogos (/games)
   ↓
2. Clica em "Repetição Espaçada"
   ↓
3. Dashboard do jogo exibe:
   - Estatísticas gerais (cards)
   - Barra de busca/filtros
   - Botão "Adicionar Baralho"
   - Grid de decks com botões [Editar] [Estudar]
   ↓
4a. Se clicar em "Editar":
   → Vai para página de edição do deck
   → Gerencia cards (adicionar, remover, filtrar)
   → Vê estatísticas do deck
   ↓
4b. Se clicar em "Estudar":
   → Vai para página de revisão
   → Processa cards com algoritmo SM-2
   → Ao finalizar, volta ao dashboard
```

---

## 🔄 Fluxo Completo de Revisão (Exemplo Detalhado)

```
1. Usuário está no dashboard do jogo
   ↓
2. Clica em "Estudar" em um deck específico
   ↓
3. Frontend: GET /api/reviews/queue?deckId={deckId}&limit=20
   ↓
3. Backend retorna fila ordenada:
   [
     { cardId: "1", phrase: "...", isNew: true, ... },
     { cardId: "2", phrase: "...", isNew: false, ... },
     ...
   ]
   ↓
4. Frontend exibe primeiro card (frente)
   "Mostra apenas a frase (sem autor)"
   ↓
5. Usuário clica para ver resposta
   Frontend mostra: frase + autor
   ↓
6. Usuário avalia: "Bom"
   Frontend: POST /api/reviews {
     cardId: "1",
     grade: "GOOD"
   }
   ↓
7. Backend processa SM-2:
   - Repetições: 0 → 1
   - Intervalo: 0 → 1 dia
   - Próxima revisão: amanhã
   ↓
8. Backend retorna card atualizado
   ↓
9. Frontend:
   - Mostra feedback "✅ Bom trabalho!"
   - Remove card da fila
   - Carrega próximo card (cardId: "2")
   - Atualiza contador: "2/20"
   ↓
10. Repete processo até completar fila
   ↓
11. Ao finalizar:
     "Parabéns! Você revisou 20 cartões hoje."
     Botões: "Estudar mais" ou "Voltar ao Dashboard"
     ↓
12. Se voltar: Retorna ao dashboard do jogo
     (estatísticas atualizadas automaticamente)
```

---

## 💡 Melhorias de UX Sugeridas

### **1. Notificações**
- Notificar quando há cartões devidos
- Lembrete diário de revisão

### **2. Streak System**
- Contar dias consecutivos de revisão
- Badges de conquistas

### **3. Modo Estudo**
- Timer por card
- Som ao virar card
- Teclado rápido: 1=Errei, 2=Difícil, 3=Bom, 4=Fácil

### **4. Visualizações**
- Gráfico de progresso do baralho
- Heatmap de atividade (estilo GitHub)
- Previsão de quando revisar novamente

### **5. Export/Import**
- Exportar baralho
- Importar de Anki
- Compartilhar baralhos

---

## 🎯 Próximos Passos de Implementação

1. ✅ Adicionar funções de API em `lib/api.ts`
2. ✅ Criar página hub de jogos (`app/games/page.tsx`)
3. ✅ Criar dashboard do jogo (`app/games/spaced-repetition/page.tsx`)
   - Componente StatsCards
   - Componente DeckFilters
   - Componente DeckCard (com botões Editar/Estudar)
   - Modal de criar deck
4. ✅ Criar página de edição de deck (`app/games/spaced-repetition/[deckId]/edit/page.tsx`)
   - Componente DeckEditCard
   - Filtros e busca de cards
   - Modal de adicionar frases
   - Paginação
   - Estatísticas do deck
5. ✅ Criar página de revisão (`app/games/spaced-repetition/[deckId]/study/page.tsx`)
   - Componente ReviewCard com animação flip
   - Componente ReviewQueue
   - Lógica de progresso
6. ✅ Adicionar navegação no menu principal
7. ✅ Implementar notificações de cartões devidos (futuro)

---

## 📝 Exemplo de Código - ReviewCard Component

```tsx
'use client'

import { useState } from 'react'
import { ReviewQueueItem, Grade } from '@/lib/api'
import { reviewsAPI } from '@/lib/api'
import styles from './ReviewCard.module.css'

interface ReviewCardProps {
  card: ReviewQueueItem
  onReviewComplete: () => void
}

export function ReviewCard({ card, onReviewComplete }: ReviewCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleGrade = async (grade: Grade) => {
    setIsProcessing(true)
    try {
      await reviewsAPI.processarRevisao(card.cardId, grade)
      onReviewComplete()
    } catch (error) {
      console.error('Erro ao processar revisão:', error)
      alert('Erro ao processar revisão. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.cardContainer}>
      <div 
        className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        {!isFlipped ? (
          <div className={styles.front}>
            <p className={styles.phrase}>{card.phrase}</p>
            <p className={styles.hint}>Clique para ver a resposta</p>
          </div>
        ) : (
          <div className={styles.back}>
            <p className={styles.phrase}>{card.phrase}</p>
            <p className={styles.author}>— {card.author}</p>
            {card.tags.length > 0 && (
              <div className={styles.tags}>
                {card.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
            
            <div className={styles.gradeButtons}>
              <button 
                onClick={() => handleGrade('AGAIN')}
                disabled={isProcessing}
                className={styles.again}
              >
                Errei
              </button>
              <button 
                onClick={() => handleGrade('HARD')}
                disabled={isProcessing}
                className={styles.hard}
              >
                Difícil
              </button>
              <button 
                onClick={() => handleGrade('GOOD')}
                disabled={isProcessing}
                className={styles.good}
              >
                Bom
              </button>
              <button 
                onClick={() => handleGrade('EASY')}
                disabled={isProcessing}
                className={styles.easy}
              >
                Fácil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

Fim do documento. 🎉

