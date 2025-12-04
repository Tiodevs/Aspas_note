# 🚀 Guia Completo de Deploy do Backend - Railway
```bash
railway up
```
Este guia contém todos os passos necessários para fazer o deploy do backend da aplicação Aspas Note no Railway.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Código do projeto versionado (GitHub, GitLab, etc.)
- Node.js instalado localmente (para testar)
- Railway CLI (opcional, mas recomendado)

---

## 🛠️ Opção 1: Deploy via Railway CLI (Recomendado)

### Passo 1: Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Passo 2: Fazer Login

```bash
railway login
```

Este comando abrirá seu navegador para autenticação. Após fazer login, você estará autenticado no terminal.

### Passo 3: Navegar para a pasta do Backend

```bash
cd Backend
```

### Passo 4: Inicializar Projeto no Railway

```bash
railway init
```

Você será perguntado:
- **Select a workspace**: Escolha seu workspace
- **Project Name**: Digite `aspas_note` (ou o nome que preferir)

Isso criará um novo projeto no Railway vinculado ao diretório atual.

### Passo 5: Fazer o Deploy

```bash
railway up
```

Este comando:
- Faz upload do código para o Railway
- Detecta o Dockerfile automaticamente
- Faz o build da imagem Docker
- Faz o deploy do container

**Nota**: Na primeira vez, o deploy pode falhar por falta de variáveis de ambiente. Continue com os próximos passos para configurar.

---

## 🌐 Opção 2: Deploy via Interface Web (GitHub)

### Passo 1: Conectar Repositório GitHub

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seus repositórios
5. Selecione o repositório `Aspas_Note` (ou o nome do seu repositório)
6. Selecione a branch (geralmente `main` ou `master`)

### Passo 2: Configurar Root Directory

O Railway precisa saber que o Dockerfile está na pasta `Backend`:

1. No projeto criado, clique no serviço do backend
2. Vá em **Settings** → **Root Directory**
3. Defina como: `Backend`
4. Clique em **Save**

### Passo 3: Configurar Build e Deploy

1. Vá em **Settings** → **Deploy**
2. Certifique-se de que:
   - **Build Command**: (vazio, o Dockerfile cuida disso)
   - **Start Command**: (vazio, o Dockerfile cuida disso)

O Railway detecta automaticamente o Dockerfile e usa os comandos definidos nele.

---

## 🗄️ Passo 6: Configurar Bancos de Dados

### 6.1: Adicionar PostgreSQL

1. No painel do projeto Railway, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. O Railway criará automaticamente o banco e fornecerá a variável `DATABASE_URL`

**Importante**: Anote ou copie a `DATABASE_URL` que será criada automaticamente.

### 6.2: Adicionar MongoDB

1. No mesmo projeto, clique em **"+ New"** novamente
2. Selecione **"Database"**
3. Escolha **"Add MongoDB"**
4. O Railway criará automaticamente o banco

**Importante**: Vá em **Variables** do MongoDB e copie o valor de `MONGO_PUBLIC_URL`.

---

## 🔧 Passo 7: Configurar Variáveis de Ambiente

### 7.1: No Serviço Backend

1. No projeto Railway, clique no **serviço do backend** (não nos bancos)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"**

### 7.2: Variáveis Obrigatórias

Adicione as seguintes variáveis:

#### DATABASE_URL
- **Nome**: `DATABASE_URL`
- **Valor**: Use a variável de referência:
  - Clique em **"Reference Variable"** (ou digite `@{postgres.DATABASE_URL}`)
  - Selecione o serviço PostgreSQL
  - Selecione `DATABASE_URL`
- **Ou copie manualmente** o valor da variável `DATABASE_URL` do serviço PostgreSQL

#### MONGO_URI
- **Nome**: `MONGO_URI`
- **Valor**: 
  - Copie o valor de `MONGO_PUBLIC_URL` do serviço MongoDB
  - **Adicione o nome do banco no final**: `/aspas_note`
  - Exemplo: `mongodb://mongo:senha@host:porta/aspas_note`
- **Ou use referência** (mas você ainda precisará adicionar `/aspas_note` manualmente)

#### JWT_SECRET
- **Nome**: `JWT_SECRET`
- **Valor**: Gere um valor aleatório seguro. Você pode usar:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Ou gere online em: https://generate-secret.vercel.app/32

#### NODE_ENV
- **Nome**: `NODE_ENV`
- **Valor**: `production`

#### PORT (Opcional)
- **Nome**: `PORT`
- **Valor**: `4000`
- **Nota**: O Railway fornece automaticamente via `$PORT`, mas definir explicitamente não faz mal.

### 7.3: Variáveis Opcionais (mas recomendadas)

#### FRONTEND_URL
- **Nome**: `FRONTEND_URL`
- **Valor**: URL do seu frontend (ex: `https://seu-frontend.com`)

#### RESEND_API_KEY
- **Nome**: `RESEND_API_KEY`
- **Valor**: Sua chave da API do Resend (para envio de emails)

#### EMAIL_SENDER
- **Nome**: `EMAIL_SENDER`
- **Valor**: Email remetente (ex: `onboarding@resend.dev`)

#### OPENAI_API_KEY
- **Nome**: `OPENAI_API_KEY`
- **Valor**: Sua chave da API da OpenAI (para funcionalidades de IA)

---

## ✅ Passo 8: Verificar Configuração

### Checklist de Variáveis

Certifique-se de que todas estas variáveis estão configuradas no serviço backend:

- [ ] `DATABASE_URL` - URL do PostgreSQL
- [ ] `MONGO_URI` - URI do MongoDB com `/aspas_note` no final
- [ ] `JWT_SECRET` - Secret para JWT (valor aleatório seguro)
- [ ] `NODE_ENV` - `production`
- [ ] `PORT` - `4000` (opcional)

---

## 🚀 Passo 9: Fazer Deploy (ou Redeploy)

### Se você está usando Railway CLI:

```bash
railway up
```

### Se você está usando GitHub:

1. Faça commit e push de qualquer alteração:
   ```bash
   git add .
   git commit -m "Deploy configuration"
   git push
   ```
2. O Railway detectará automaticamente o push e fará novo deploy

### Ou faça redeploy manual:

1. No Railway, vá no serviço backend
2. Aba **"Deployments"**
3. Clique nos 3 pontos (⋯) do deployment mais recente
4. Selecione **"Redeploy"**

---

## 📊 Passo 10: Monitorar o Deploy

### Ver Logs em Tempo Real

1. No Railway, vá no serviço backend
2. Aba **"Deployments"**
3. Clique no deployment mais recente
4. Aba **"Deploy Logs"** ou **"Logs"**

### Verificar Build

O build deve mostrar:
```
✓ npm ci
✓ npx prisma generate
✓ npm run build
✓ exporting to docker image format
```

### Verificar Inicialização

Após o build, você deve ver:
```
🔄 Executando migrações do Prisma...
Applied migration: ...
🚀 Iniciando aplicação...
🚀 Servidor Express rodando na porta 4000
✅ MongoDB connected successfully
```

---

## 🔍 Passo 11: Testar a Aplicação

### 11.1: Obter URL do Deploy

1. No Railway, vá no serviço backend
2. Aba **"Settings"** → **"Networking"**
3. Clique em **"Generate Domain"** (se ainda não tiver)
4. Copie a URL (ex: `https://aspas-note-production.up.railway.app`)

### 11.2: Testar Health Check

```bash
curl https://seu-app.railway.app/api/health
```

**Resposta esperada**:
```json
{"status":"ok"}
```

### 11.3: Testar Rota Principal

```bash
curl https://seu-app.railway.app/
```

**Resposta esperada**:
```json
{
  "message": "Bem-vindo ao backend da Aspas Note!",
  "version": "1.0.0",
  ...
}
```

---

## 🐛 Troubleshooting (Solução de Problemas)

### ❌ Erro: "Can't reach database server at localhost:5432"

**Causa**: Variável `DATABASE_URL` não configurada ou incorreta.

**Solução**:
1. Verifique se o PostgreSQL foi criado no Railway
2. Vá em **Variables** do backend
3. Certifique-se de que `DATABASE_URL` está configurada
4. Use a referência `@{postgres.DATABASE_URL}` ou copie manualmente

### ❌ Erro: "MongoDB connection failed"

**Causa**: Variável `MONGO_URI` não configurada ou incorreta.

**Solução**:
1. Verifique se o MongoDB foi criado no Railway
2. Copie `MONGO_PUBLIC_URL` do serviço MongoDB
3. Adicione `/aspas_note` no final da URI
4. Configure `MONGO_URI` no serviço backend

### ❌ Erro: "./start.sh: not found"

**Causa**: Problema com quebras de linha (CRLF vs LF). **Já resolvido** ✅

O Dockerfile atual usa comando direto, não precisa mais do arquivo `start.sh`.

### ❌ Erro: "Prisma migration failed"

**Causa**: Migrações não foram executadas ou `DATABASE_URL` incorreta.

**Solução**:
1. Verifique se `DATABASE_URL` está correta
2. Verifique os logs do deploy para ver qual migração falhou
3. O Dockerfile já executa `npx prisma migrate deploy` automaticamente ✅

### ❌ Build falha com "npm ci" ou "npm run build"

**Causa**: Erro no código ou dependências.

**Solução**:
1. Teste localmente primeiro:
   ```bash
   cd Backend
   npm ci
   npm run build
   ```
2. Verifique os logs do Railway para ver o erro específico
3. Certifique-se de que o `Root Directory` está configurado como `Backend`

### ❌ Porta não encontrada

**Causa**: Aplicação não está escutando na porta correta.

**Solução**:
- O código já está configurado para usar `process.env.PORT` ✅
- O Railway fornece a porta via variável `PORT` automaticamente
- Não precisa configurar manualmente

---

## 📝 Comandos Úteis

### Railway CLI

```bash
# Ver status do projeto
railway status

# Ver logs em tempo real
railway logs

# Abrir projeto no navegador
railway open

# Fazer deploy
railway up

# Listar variáveis de ambiente
railway variables

# Adicionar variável
railway variables set NOME_VARIAVEL=valor

# Ver informações do serviço
railway service
```

### Local (para testar antes do deploy)

```bash
# Instalar dependências
npm ci

# Gerar Prisma Client
npx prisma generate

# Buildar projeto
npm run build

# Rodar localmente
npm start

# Testar com Docker localmente
docker build -t aspas-note-backend .
docker run -p 4000:4000 --env-file .env aspas-note-backend
```

---

## 🔄 Atualizações Futuras

### Para fazer deploy de atualizações:

1. **Faça suas alterações no código**

2. **Commit e Push** (se usando GitHub):
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   git push
   ```
   O Railway detectará automaticamente e fará novo deploy.

3. **Ou use Railway CLI**:
   ```bash
   railway up
   ```

### Para executar migrações do Prisma manualmente:

Se precisar rodar migrações manualmente após o deploy:

```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Ou via interface web:
# Settings → Deploy → Deploy Command
# Adicione: npx prisma migrate deploy && npm start
```

---

## 📚 Estrutura do Dockerfile

O Dockerfile atual:

```dockerfile
FROM node:20-alpine

# Instalar OpenSSL (necessário para o Prisma)
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar e instalar dependências
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copiar código e buildar
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Executa migrações e inicia aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Build passou sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] PostgreSQL criado e `DATABASE_URL` configurada
- [ ] MongoDB criado e `MONGO_URI` configurada (com `/aspas_note`)
- [ ] `JWT_SECRET` configurada com valor seguro
- [ ] `NODE_ENV=production` configurada
- [ ] Health check retorna `{"status":"ok"}`
- [ ] Logs mostram conexão bem-sucedida com MongoDB
- [ ] Logs mostram migrações do Prisma executadas
- [ ] Domínio configurado no Railway

---

## 🆘 Suporte

- [Documentação Railway](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Documentação Prisma](https://www.prisma.io/docs/)

---

**🎉 Pronto! Seu backend está no ar!**

Para verificar o status:
```bash
curl https://seu-app.railway.app/api/health
```

