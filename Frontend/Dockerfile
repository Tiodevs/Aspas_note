# Usar imagem oficial do Node.js
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto do código fonte
COPY . .

# Buildar o projeto Next.js
RUN npm run build

# Expor a porta que a aplicação roda
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
