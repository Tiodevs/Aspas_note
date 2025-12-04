# 📝 Aspas Note

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

**Uma aplicação full-stack moderna para gerenciar e compartilhar frases inspiradoras, com integração de IA para extração automática de conteúdo.**

[Features](#-funcionalidades) • [Tecnologias](#-stack-tecnológica) • [Arquitetura](#-arquitetura) • [Instalação](#-como-executar) • [Documentação](#-documentação)

</div>

---

## 📋 Sobre o Projeto

**Aspas Note** é uma aplicação web completa desenvolvida como projeto de portfólio, demonstrando habilidades avançadas em desenvolvimento full-stack moderno. A plataforma permite que usuários salvem, organizem e compartilhem frases inspiradoras, com recursos avançados como extração automática de frases usando Inteligência Artificial, sistema de repetição espaçada para memorização e feed social interativo.

### 🎯 Objetivo do Projeto

Este projeto foi desenvolvido para demonstrar:
- **Arquitetura escalável** com separação clara entre frontend e backend
- **Boas práticas de desenvolvimento** com TypeScript, testes automatizados e validação de dados
- **Integração de IA** usando LangChain e OpenAI para funcionalidades inteligentes
- **UX/UI moderna** com design responsivo e experiência fluida
- **DevOps** com containerização Docker e CI/CD ready

---

## ✨ Funcionalidades

### 🔐 Autenticação e Perfil
- Sistema completo de autenticação com JWT
- Recuperação de senha via email
- Perfis de usuário personalizáveis
- Sistema de follow/unfollow entre usuários

### 📚 Gerenciamento de Frases
- CRUD completo de frases com tags e autores
- Busca avançada com filtros (autor, tags, texto)
- Feed social com frases de usuários seguidos
- **Extração automática de frases usando IA** (OpenAI + LangChain)
  - Cole textos longos e a IA identifica e extrai frases relevantes
  - Sugestão automática de tags e autores
  - Score de confiança para cada frase extraída

### 🎮 Sistema de Repetição Espaçada
- Criação de baralhos personalizados
- Algoritmo de repetição espaçada (Spaced Repetition)
- Sistema de revisão inteligente para memorização
- Estatísticas de progresso e performance

### 🎨 Interface Moderna
- Design responsivo (mobile-first)
- Dark mode
- Animações suaves com Framer Motion
- Navegação intuitiva

---

## 🛠 Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 15.5.3 | Framework React com Server Components |
| **React** | 19.1.0 | Biblioteca UI |
| **TypeScript** | 5.7.3 | Tipagem estática |
| **NextAuth.js** | 5.0.0-beta | Autenticação e sessões |
| **Framer Motion** | 12.23.24 | Animações |
| **CSS Modules** | - | Estilização modular |

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.21.2 | Framework web |
| **TypeScript** | 5.7.3 | Tipagem estática |
| **Prisma** | 5.10.2 | ORM para PostgreSQL |
| **PostgreSQL** | 15 | Banco de dados relacional |
| **MongoDB** | Latest | Banco NoSQL para logs |
| **JWT** | 9.0.2 | Autenticação |
| **Zod** | 4.0.5 | Validação de schemas |
| **LangChain** | 0.3.36 | Framework para IA |
| **OpenAI API** | - | Extração de frases com IA |
| **Jest** | 30.0.4 | Testes automatizados |

### DevOps & Ferramentas
- **Docker** & **Docker Compose** - Containerização
- **ESLint** - Linting de código
- **Git** - Controle de versão

---

## 🏗 Arquitetura

### Estrutura do Projeto

```
Aspas_Note/
├── Frontend/                 # Next.js Application
│   ├── app/                  # App Router (Next.js 15)
│   │   ├── api/              # API Routes
│   │   ├── phrases/          # Página de frases
│   │   ├── feed/             # Feed social
│   │   ├── games/            # Sistema de repetição espaçada
│   │   └── profile/          # Perfis de usuário
│   ├── components/           # Componentes reutilizáveis
│   └── lib/                  # Utilitários e API client
│
├── Backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/      # Controladores REST
│   │   ├── services/         # Lógica de negócio
│   │   │   ├── ai/           # Serviço de IA (LangChain)
│   │   │   ├── phrases/      # Gerenciamento de frases
│   │   │   └── auth/         # Autenticação
│   │   ├── routes/           # Rotas da API
│   │   ├── middlewares/      # Middlewares (auth, validation)
│   │   ├── schemas/          # Schemas Zod para validação
│   │   └── __tests__/        # Testes automatizados
│   └── prisma/               # Schema e migrações
│
└── docker-compose.yml        # Orquestração de containers
```

### Padrões e Práticas

- **Arquitetura em Camadas**: Separação clara entre controllers, services e repositories
- **SOLID Principles**: Código modular e extensível
- **RESTful API**: Endpoints bem estruturados e documentados
- **Type Safety**: TypeScript em todo o stack
- **Validation**: Zod schemas para validação de dados
- **Error Handling**: Tratamento centralizado de erros
- **Security**: JWT authentication, password hashing, CORS configurado

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose (recomendado)
- PostgreSQL (se executar localmente)
- MongoDB (se executar localmente)

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/aspas-note.git
cd aspas-note

# Configure as variáveis de ambiente
cp Backend/.exemple.env Backend/.env
cp Frontend/.exemple.env Frontend/.env

# Edite os arquivos .env com suas configurações
# (especialmente DATABASE_URL, JWT_SECRET, OPENAI_API_KEY)

# Inicie todos os serviços
docker-compose up --build

# A aplicação estará disponível em:
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

### Opção 2: Execução Local

#### Backend

```bash
cd Backend

# Instale as dependências
npm install

# Configure o .env
cp .exemple.env .env
# Edite o .env com suas configurações

# Execute as migrações
npx prisma migrate dev

# Inicie o servidor
npm run dev
```

#### Frontend

```bash
cd Frontend

# Instale as dependências
npm install

# Configure o .env.local (se necessário)
cp .exemple.env .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/aspas_note
MONGO_URI=mongodb://localhost:27017/aspas_note
JWT_SECRET=seu-jwt-secret-super-seguro
OPENAI_API_KEY=sua-chave-openai
RESEND_API_KEY=sua-chave-resend
PORT=4000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
AUTH_SECRET=seu-auth-secret
```

---

## 🧪 Testes

O projeto inclui testes automatizados no backend:

```bash
cd Backend

# Executar todos os testes
npm test

# Executar testes com coverage
npm test -- --coverage

# Modo watch
npm run test:watch
```

**Cobertura de Testes:**
- Testes unitários para services
- Testes de integração para controllers
- Testes de middlewares de validação

---

## 📊 Funcionalidades Técnicas Destacadas

### 🤖 Integração com IA
- **Extração Inteligente de Frases**: Usando LangChain e OpenAI GPT-4o-mini
- **Processamento de Texto**: Análise de textos longos para identificar frases relevantes
- **Sugestão Automática**: Tags e autores sugeridos pela IA
- **Score de Confiança**: Cada frase extraída recebe um score de relevância

### 🔄 Sistema de Repetição Espaçada
- Implementação do algoritmo SM-2 (SuperMemo 2)
- Sistema de revisão adaptativo baseado no desempenho
- Estatísticas detalhadas de progresso

### 🔐 Segurança
- Autenticação JWT com refresh tokens
- Hash de senhas com bcryptjs
- Validação de dados com Zod
- CORS configurado
- Rate limiting ready

### 📱 Responsividade
- Design mobile-first
- Breakpoints otimizados
- Touch-friendly interface
- Performance otimizada

---

## 📈 Melhorias Futuras

- Deploy em produção (Vercel + Railway/Render)
- Testes E2E com Playwright
- PWA (Progressive Web App)
- Exportação de frases (PDF, CSV)
- Compartilhamento de baralhos
- Notificações push
- Analytics e métricas de uso

---


## 🤝 Contribuindo

Este é um projeto de portfólio, mas sugestões e melhorias são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request


## 👨‍💻 Autor

**Seu Nome**

- GitHub: [@seu-usuario](https://github.com/Tiodevs)
- LinkedIn: [Seu Perfil](https://www.linkedin.com/in/felipe-p-santos-a1a3b9207/)
- Email: santospefelipe@gmail.com

---

<div align="center">

**Desenvolvido com ❤️ para demonstrar habilidades em desenvolvimento full-stack moderno**

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>
