# Deploy na Vercel - Aspas Note Backend

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel da Vercel:

```
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SENDER=your-email@gmail.com
NODE_ENV=production
```

## Passos para Deploy

1. **Conectar Repositório**: Conecte seu repositório GitHub na Vercel
2. **Configurar Root Directory**: Defina `Backend` como root directory
3. **Configurar Build Command**: `npm run vercel-build`
4. **Configurar Variáveis de Ambiente**: Adicione todas as variáveis acima
5. **Deploy**: A Vercel fará o deploy automaticamente

## Banco de Dados

Recomendamos usar:
- **Neon** (PostgreSQL gratuito)
- **Supabase** (PostgreSQL gratuito)
- **PlanetScale** (MySQL serverless)

## Comandos Importantes

- `npm run vercel-build`: Build para produção na Vercel
- `npx prisma db push`: Aplicar schema ao banco
- `npx prisma generate`: Gerar cliente Prisma

## Estrutura Serverless

O projeto foi adaptado para funcionar como serverless functions na Vercel:
- `vercel.json`: Configuração de rotas e builds
- `src/server.ts`: Adaptado para desenvolvimento local e produção
- `src/prisma/client.ts`: Singleton pattern para evitar múltiplas conexões
