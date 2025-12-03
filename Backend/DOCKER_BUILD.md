# Como testar a imagem Docker do Backend

## 1. Construir a imagem Docker

Execute na pasta `Backend/`:

```bash
docker build -t aspas-note-backend .
```

Ou se preferir com tag específica:

```bash
docker build -t aspas-note-backend:latest .
```

## 2. Rodar o container com variáveis de ambiente

Você precisa fornecer as variáveis de ambiente necessárias. Você pode fazer isso de duas formas:

### Opção A: Usando arquivo .env (recomendado para teste local)

Certifique-se de que o arquivo `.env` existe na pasta `Backend/` com todas as variáveis necessárias:

```bash
docker run -p 4000:4000 --env-file .env aspas-note-backend
```

### Opção B: Passando variáveis diretamente (PowerShell)

```powershell
docker run -p 4000:4000 `
  -e PORT=4000 `
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" `
  -e MONGO_URI="mongodb://host:27017/aspas_note" `
  -e JWT_SECRET="seu-jwt-secret" `
  -e RESEND_API_KEY="sua-api-key" `
  -e EMAIL_SENDER="seu-email@domain.com" `
  -e OPENAI_API_KEY="sua-openai-key" `
  -e FRONTEND_URL="http://localhost:3000" `
  -e NODE_ENV=production `
  aspas-note-backend
```

### Opção C: Modo interativo (para debug)

Para ver os logs e poder parar facilmente com Ctrl+C:

```bash
docker run -it -p 4000:4000 --env-file .env aspas-note-backend
```

## 3. Variáveis de ambiente necessárias

Certifique-se de ter estas variáveis configuradas:

- `DATABASE_URL` - URL de conexão do PostgreSQL (Prisma)
- `MONGO_URI` - URI de conexão do MongoDB
- `JWT_SECRET` - Secret para assinatura de tokens JWT
- `PORT` - Porta do servidor (padrão: 4000)
- `FRONTEND_URL` - URL do frontend (para CORS)
- `NODE_ENV` - Ambiente (development/production)

Opcionais:
- `RESEND_API_KEY` - Para envio de emails
- `EMAIL_SENDER` - Email remetente
- `OPENAI_API_KEY` - Para funcionalidades de IA

## 4. Verificar se está funcionando

Após iniciar o container, teste:

```bash
# Health check
curl http://localhost:4000/health

# Ou acesse no navegador
# http://localhost:4000/health
```

## 5. Ver logs do container

Se você rodou em background (sem `-it`), você pode ver os logs:

```bash
# Listar containers rodando
docker ps

# Ver logs do container (use o ID ou nome do container)
docker logs -f <container-id>
```

## 6. Parar o container

```bash
# Listar containers
docker ps

# Parar o container
docker stop <container-id>

# Ou forçar parada
docker kill <container-id>
```

## 7. Para deploy no Railway

A imagem está pronta para deploy! No Railway, você pode:

1. **Conectar via GitHub**: O Railway vai fazer o build automaticamente
2. **Deploy via Dockerfile**: Certifique-se de que o Dockerfile está na raiz ou configure o caminho no Railway
3. **Variáveis de ambiente**: Configure todas as variáveis necessárias no painel do Railway

### Configuração recomendada no Railway:
- Build Command: `npm ci && npm run build` (ou deixe o Dockerfile fazer isso)
- Start Command: `npm start` (já configurado no Dockerfile)
- Port: `4000` (ou a variável `PORT` que você configurar)

## Nota importante

O backend precisa estar conectado a:
- Um banco PostgreSQL (para Prisma)
- Um banco MongoDB (para logs)

Certifique-se de que esses serviços estão acessíveis antes de rodar o container, ou configure as variáveis de ambiente para apontar para serviços externos (como os do Railway).

## Troubleshooting

### Erro de conexão com banco
- Verifique se `DATABASE_URL` e `MONGO_URI` estão corretos
- Certifique-se de que os bancos estão acessíveis da rede do container

### Porta já em uso
```bash
# Ver qual processo está usando a porta 4000
netstat -ano | findstr :4000

# Ou use outra porta
docker run -p 4001:4000 -e PORT=4000 --env-file .env aspas-note-backend
```

### Verificar se a imagem foi criada
```bash
docker images | grep aspas-note-backend
```

