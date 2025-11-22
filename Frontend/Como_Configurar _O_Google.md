# 🔐 Configuração Google OAuth - Aspas Note

## 📋 Pré-requisitos

1. ✅ NextAuth.js configurado
2. ✅ Conta Google (Gmail)
3. ✅ Projeto no Google Cloud Console

## 🚀 Passo a Passo

### 1. **Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Clique em "Novo Projeto" ou selecione um existente
3. Nome do projeto: `aspas-note-auth`
4. Clique em "Criar"

### 2. **Ativar Google+ API**

1. No menu lateral → **APIs e Serviços** → **Biblioteca**
2. Pesquise por "Google+ API"
3. Clique em "Ativar"

### 3. **Configurar Tela de Consentimento OAuth**

1. **APIs e Serviços** → **Tela de consentimento OAuth**
2. Selecione **"Externo"** (para qualquer usuário Google)
3. Preencha as informações obrigatórias:

```
Nome do aplicativo: Aspas Note
Email de suporte do usuário: seu@email.com
Domínios autorizados: localhost (para desenvolvimento)
Email do desenvolvedor: seu@email.com
```

4. **Escopos**: Adicione os seguintes escopos:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

5. **Usuários de teste** (modo desenvolvimento):
   - Adicione seu email e emails de teste

### 4. **Criar Credenciais OAuth 2.0**

1. **APIs e Serviços** → **Credenciais**
2. **+ Criar Credenciais** → **ID do cliente OAuth 2.0**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `aspas-note-web-client`

#### **🔧 URLs Importantes:**

**Origens JavaScript autorizadas:**
```
http://localhost:3000
https://seudominio.com (produção)
```

**URIs de redirecionamento autorizados:**
```
http://localhost:3000/api/auth/callback/google
https://seudominio.com/api/auth/callback/google (produção)
```

5. Clique em **"Criar"**
6. **Copie e salve** o `Client ID` e `Client Secret`

### 5. **Configurar Variáveis de Ambiente**

Crie/atualize o arquivo `.env.local`:

```env
# NextAuth.js
NEXTAUTH_SECRET=seu_nextauth_secret_super_seguro_aqui
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

No Google Console, adicione suas URLs de produção:

```
Origens JavaScript autorizadas:
https://aspas-note.com

URIs de redirecionamento:
https://aspas-note.com/api/auth/callback/google
```

### **2. Variáveis de Ambiente Produção**

```env
NEXTAUTH_SECRET=secret_muito_mais_complexo_para_producao
NEXTAUTH_URL=https://aspas-note.com
GOOGLE_CLIENT_ID=seu_client_id_producao
GOOGLE_CLIENT_SECRET=seu_client_secret_producao
NEXT_PUBLIC_API_URL=https://api.aspas-note.com
```
