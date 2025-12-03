# Deploy no Railway - Guia Completo

O Railway detecta automaticamente o Dockerfile e faz o deploy. **Você NÃO precisa de docker-compose** - isso é apenas para desenvolvimento local.

## 📋 Checklist Pré-Deploy

### 1. Dockerfile está pronto ✅
O Dockerfile já está configurado corretamente:
- Usa Node 18 Alpine
- Instala dependências
- Faz build do TypeScript
- Expõe a porta (Railway vai usar a variável `PORT` automaticamente)

### 2. Health Check ✅
A rota `/api/health` está disponível para o Railway verificar se a aplicação está funcionando.

### 3. Servidor escuta em 0.0.0.0 ✅
O servidor foi configurado para escutar em `0.0.0.0`, permitindo conexões externas do Railway.

## 🚀 Passo a Passo no Railway

### Opção 1: Deploy via GitHub (Recomendado)

1. **Acesse [railway.app](https://railway.app)** e faça login
2. **Crie um novo projeto** → "Deploy from GitHub repo"
3. **Selecione seu repositório** e a branch
4. **Configure o Root Directory**:
   - No Railway, vá em **Settings** → **Root Directory**
   - Defina como: `Backend`
5. **Configure as variáveis de ambiente** (veja seção abaixo)

### Opção 2: Deploy via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Fazer login
railway login

# Inicializar projeto
cd Backend
railway init

# Fazer deploy
railway up
```

## 🔧 Variáveis de Ambiente no Railway

No painel do Railway, vá em **Variables** e configure:

### Obrigatórias:
```
DATABASE_URL=postgresql://... (Railway fornece quando você adiciona PostgreSQL)
MONGO_URI=mongodb://... (Railway fornece quando você adiciona MongoDB)
JWT_SECRET=seu-jwt-secret-aqui (gere um valor aleatório seguro)
PORT=4000 (opcional, Railway fornece automaticamente via PORT)
NODE_ENV=production
```

### Opcionais (mas recomendadas):
```
FRONTEND_URL=https://seu-frontend.com
RESEND_API_KEY=sua-chave-do-resend
EMAIL_SENDER=seu-email@domain.com
OPENAI_API_KEY=sua-chave-openai
```

## 🗄️ Configurar Bancos de Dados no Railway

### PostgreSQL (Prisma)
1. No projeto Railway, clique em **"New"** → **"Database"** → **"Add PostgreSQL"**
2. O Railway vai criar automaticamente e fornecer a variável `DATABASE_URL`
3. O Prisma vai detectar automaticamente e aplicar as migrações (se configurado)

### MongoDB
1. No projeto Railway, clique em **"New"** → **"Database"** → **"Add MongoDB"**
2. O Railway vai criar automaticamente e fornecer a variável `MONGO_URI`
3. Configure a variável `MONGO_URI` com a URI fornecida

## 📝 Executar Migrações do Prisma

O Railway pode executar migrações automaticamente. Você tem duas opções:

### Opção 1: Adicionar ao Dockerfile (Recomendado)
Adicione antes do `CMD` no Dockerfile:
```dockerfile
RUN npx prisma migrate deploy
```

### Opção 2: Comando de Deploy no Railway
No Railway, vá em **Settings** → **Deploy** → **Deploy Command**:
```bash
npx prisma migrate deploy && npm start
```

⚠️ **Nota**: A primeira opção é melhor porque garante que as migrações rodem sempre durante o build.

## 🔍 Verificar Health Check

Após o deploy, teste:
```bash
curl https://seu-app.railway.app/api/health
```

Deve retornar:
```json
{"status":"ok"}
```

## 🌐 Domínio Personalizado

1. No Railway, vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"** para um domínio `.railway.app`
3. Ou adicione um domínio customizado

## 📊 Monitoramento

O Railway fornece:
- **Logs em tempo real** na aba "Deployments"
- **Métricas** de CPU, memória e rede
- **Health checks** automáticos

## 🐛 Troubleshooting

### Build falha
- Verifique os logs no Railway
- Certifique-se de que o `Root Directory` está configurado como `Backend`
- Verifique se todas as dependências estão no `package.json`

### Aplicação não inicia
- Verifique se todas as variáveis de ambiente obrigatórias estão configuradas
- Verifique os logs para erros de conexão com bancos de dados
- Certifique-se de que `DATABASE_URL` e `MONGO_URI` estão corretas

### Erro de conexão com banco
- Verifique se os bancos de dados estão no mesmo projeto Railway
- Certifique-se de que as variáveis `DATABASE_URL` e `MONGO_URI` estão atualizadas
- Verifique as conexões de rede no Railway

### Porta não encontrada
- O Railway fornece a porta via variável `PORT` automaticamente
- Certifique-se de que o código usa `process.env.PORT` (já está configurado ✅)

## 📚 Recursos

- [Documentação do Railway](https://docs.railway.app/)
- [Railway + Prisma](https://docs.railway.app/guides/postgres)
- [Variáveis de Ambiente no Railway](https://docs.railway.app/develop/variables)

