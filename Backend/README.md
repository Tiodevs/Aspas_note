# Aspas Note - Backend

## Configuração do Projeto

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração do Banco de Dados

1. Configure a variável `DATABASE_URL` no arquivo `.env`
2. Execute as migrações:
```bash
npx prisma migrate dev
```

### 3. Configuração do Email (Nodemailer)

#### Criar arquivo .env

Crie um arquivo `.env` na pasta `Backend/` com as seguintes variáveis:

```env
# Configurações do Servidor
PORT=4000
FRONTEND_URL=http://localhost:3000

# Configurações do Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/aspas_note?schema=public"

# Configurações do Email (Nodemailer)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_SENDER=seu-email@gmail.com

# Configurações do SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

#### Configuração para Gmail

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app**:
   - Vá para https://myaccount.google.com/security
   - Clique em "Senhas de app"
   - Selecione "Email" e gere uma senha
   - Use essa senha no campo `EMAIL_PASS`

#### Testando a Configuração

Execute o script de teste:

```bash
node test-email.js
```

Ou use as rotas da API:

```bash
# Testar configuração
GET /api/email/test

# Enviar email de teste
POST /api/email/test-send
{
  "email": "seu-email@gmail.com",
  "nome": "Seu Nome"
}
```

### 4. Executando o Projeto

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

### 5. Testes

```bash
npm test
```

## Estrutura do Projeto

```
src/
├── config/          # Configurações
├── controllers/     # Controladores
├── middlewares/     # Middlewares
├── routes/          # Rotas
├── services/        # Serviços
│   ├── auth/       # Serviços de autenticação
│   ├── email/      # Serviços de email
│   └── phrases/    # Serviços de frases
├── types/          # Tipos TypeScript
└── prisma/         # Configuração do Prisma
```

## Endpoints Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Esqueci a senha
- `POST /api/auth/reset-password` - Redefinir senha

### Frases
- `GET /api/phrases` - Listar frases
- `POST /api/phrases` - Criar frase
- `PUT /api/phrases/:id` - Atualizar frase
- `DELETE /api/phrases/:id` - Deletar frase

### Email (Teste)
- `GET /api/email/test` - Testar configuração
- `POST /api/email/test-send` - Enviar email de teste

## Documentação Completa

Para mais detalhes sobre a configuração do email, consulte o arquivo `EMAIL_CONFIG.md`. 