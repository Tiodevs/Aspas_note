FROM node:20-alpine

# Instalar OpenSSL (necessário para o Prisma)
RUN apk add --no-cache openssl

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
# Usamos ci para instalações limpas em ambientes de build/produção
RUN npm ci

# Copiar o resto do código fonte
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Buildar o projeto TypeScript
RUN npm run build

# Expor a porta que a aplicação roda
EXPOSE 4000

# Comando para iniciar a aplicação (roda migrações primeiro)
# Usamos sh -c para evitar problemas com quebras de linha do Windows
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
