# Aspas Note

Bem-vindo ao **Aspas Note**, uma aplicação completa para salvar e gerenciar frases de famosos. Este projeto é composto por um Backend robusto em Node.js e um Frontend moderno em Next.js.

## 🚀 Tecnologias Utilizadas

### Backend
O backend foi construído focando em performance, segurança e tipagem estática.
- **Node.js** & **Express**: Base da API RESTful.
- **TypeScript**: Para maior segurança e manutenibilidade do código.
- **Prisma ORM**: Para interação eficiente com o banco de dados PostgreSQL.
- **PostgreSQL**: Banco de dados relacional.
- **JWT (JSON Web Tokens)**: Para autenticação segura.
- **Bcryptjs**: Para hash de senhas.
- **Zod**: Para validação de dados.
- **Nodemailer**: Para envio de emails (recuperação de senha, etc).
- **Jest**: Para testes automatizados.

### Frontend
O frontend oferece uma interface de usuário interativa e responsiva.
- **Next.js 15**: Framework React para produção, utilizando recursos modernos como Server Components.
- **React 19**: Biblioteca para construção de interfaces.
- **TypeScript**: Tipagem estática para componentes e lógica.
- **CSS Modules / Global CSS**: Estilização customizada.
- **NextAuth.js (v5 Beta)**: Gerenciamento de autenticação e sessões.

## 📂 Estrutura do Projeto

O projeto está dividido em dois diretórios principais:

```
Aspas_Note/
├── Backend/    # API e Lógica de Servidor
└── Frontend/   # Interface de Usuário (Next.js)
```

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada).
- PostgreSQL instalado e rodando.

### 1. Configurando o Backend

1.  Acesse a pasta do backend:
    ```bash
    cd Backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    - Crie um arquivo `.env` baseado no exemplo (ou consulte o `README.md` dentro da pasta `Backend` para detalhes das variáveis necessárias como `DATABASE_URL`, `JWT_SECRET`, etc).
4.  Execute as migrações do banco de dados:
    ```bash
    npx prisma migrate dev
    ```
5.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    O servidor rodará em `http://localhost:4000` (padrão).

### 2. Configurando o Frontend

1.  Acesse a pasta do frontend:
    ```bash
    cd Frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    - Crie um arquivo `.env.local` se necessário (consulte a documentação do NextAuth para `AUTH_SECRET`, etc).
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    A aplicação rodará em `http://localhost:3000`.

## 🧪 Testes (Backend)

Para rodar os testes automatizados do backend:

```bash
cd Backend
npm test
```

## 📚 Documentação Adicional

- **Backend**: Consulte `Backend/README.md` para detalhes específicos sobre endpoints da API, configuração de email e arquitetura.
- **Frontend**: Consulte `Frontend/README.md` para detalhes específicos da interface (se disponível).

---
Desenvolvido como parte dos estudos do projeto Aspas Note.
