FROM node:18-alpine

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

# Tornar o script de start executável
RUN chmod +x start.sh

# Expor a porta que a aplicação roda
EXPOSE 4000

# Comando para iniciar a aplicação (roda migrações primeiro)
CMD ["./start.sh"]
