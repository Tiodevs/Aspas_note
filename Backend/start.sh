#!/bin/sh

# Executar migrações do Prisma
echo "🔄 Executando migrações do Prisma..."
npx prisma migrate deploy

# Iniciar a aplicação
echo "🚀 Iniciando aplicação..."
exec npm start

