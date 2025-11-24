# 🔐 Como Configurar Google OAuth - Passo a Passo Atualizado

Este guia mostra como obter o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` para usar no NextAuth.js.

---

## 📋 Pré-requisitos

- Conta Google (Gmail)
- Acesso ao Google Cloud Console

---

## 🚀 Passo a Passo

### **Passo 1: Acessar o Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Se for a primeira vez, aceite os termos de serviço

---

### **Passo 2: Criar um Novo Projeto**

1. No topo da página, clique no dropdown de projetos (ao lado do logo do Google Cloud)
2. Clique em **"Novo Projeto"** ou **"CREATE PROJECT"**
3. Preencha:
   - **Nome do projeto**: `Aspas Note` (ou qualquer nome)
   - **Organização**: Deixe como está (ou selecione se tiver)
4. Clique em **"Criar"** ou **"CREATE"**
5. Aguarde alguns segundos até o projeto ser criado
6. Selecione o projeto recém-criado no dropdown de projetos

---

### **Passo 3: Configurar a Tela de Consentimento OAuth**

1. No menu lateral esquerdo, vá em:
   - **"APIs e serviços"** → **"Tela de consentimento OAuth"**
   - Ou: **"APIs & Services"** → **"OAuth consent screen"**

2. Selecione o tipo de usuário:
   - **"Externo"** (para usuários fora da sua organização)
   - Clique em **"Criar"** ou **"CREATE"**

3. Preencha as informações obrigatórias:
   - **Nome do aplicativo**: `Aspas Note` (ou o nome que preferir)
   - **E-mail de suporte do usuário**: Seu e-mail
   - **E-mail de contato do desenvolvedor**: Seu e-mail
   - Clique em **"Salvar e continuar"** ou **"SAVE AND CONTINUE"**

4. **Escopos** (Scopes):
   - Clique em **"Salvar e continuar"** (pode deixar os escopos padrão)

5. **Usuários de teste** (Test users):
   - Adicione seu e-mail e outros e-mails que vão testar durante o desenvolvimento
   - Clique em **"Adicionar usuários"** ou **"ADD USERS"**
   - Clique em **"Salvar e continuar"**

6. **Resumo** (Summary):
   - Revise as informações
   - Clique em **"Voltar ao painel"** ou **"BACK TO DASHBOARD"**

---

### **Passo 4: Criar Credenciais OAuth 2.0**

1. No menu lateral, vá em:
   - **"APIs e serviços"** → **"Credenciais"**
   - Ou: **"APIs & Services"** → **"Credentials"**

2. Clique no botão **"+ CRIAR CREDENCIAIS"** ou **"+ CREATE CREDENTIALS"** no topo

3. Selecione **"ID do cliente OAuth"** ou **"OAuth client ID"**

4. Se aparecer uma mensagem sobre configurar a tela de consentimento, você já fez isso no passo anterior. Clique em **"Configurar tela de consentimento"** se necessário.

5. Preencha o formulário:
   - **Tipo de aplicativo**: Selecione **"Aplicativo da Web"** ou **"Web application"**
   - **Nome**: `Aspas Note Web Client` (ou qualquer nome)

6. **URIs de redirecionamento autorizados** (Authorized redirect URIs):
   
   Adicione as seguintes URLs (uma por vez, clicando em **"+ ADICIONAR URI"**):
   
   **Para desenvolvimento local:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   
   **Para produção (quando fizer deploy):**
   ```
   https://seu-dominio.com/api/auth/callback/google
   ```
   
   **Exemplo com Vercel:**
   ```
   https://aspas-note.vercel.app/api/auth/callback/google
   ```

7. Clique em **"Criar"** ou **"CREATE"**

8. **IMPORTANTE**: Uma janela popup aparecerá com suas credenciais:
   - **ID do cliente** (Client ID) - Este é o `GOOGLE_CLIENT_ID`
   - **Segredo do cliente** (Client secret) - Este é o `GOOGLE_CLIENT_SECRET`
   
   ⚠️ **COPIE E SALVE ESSAS INFORMAÇÕES AGORA!** Você não poderá ver o secret novamente depois de fechar essa janela.

---

### **Passo 5: Configurar no Projeto**

1. No seu projeto, abra o arquivo `.env` ou `.env.local` na pasta `Frontend`

2. Adicione as credenciais:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

3. **Substitua** `seu_client_id_aqui` e `seu_client_secret_aqui` pelos valores que você copiou

4. Salve o arquivo

5. **Reinicie o servidor Next.js** para as variáveis de ambiente serem carregadas

---

### **Passo 6: Habilitar a API do Google+ (se necessário)**

Alguns projetos podem precisar habilitar a API:

1. No menu lateral, vá em:
   - **"APIs e serviços"** → **"Biblioteca"**
   - Ou: **"APIs & Services"** → **"Library"**

2. Procure por **"Google+ API"** ou **"People API"**

3. Clique e depois em **"Habilitar"** ou **"ENABLE"**

---

## ✅ Verificação

1. Certifique-se de que o arquivo `.env` tem:
   ```env
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   NEXTAUTH_SECRET=qualquer_string_secreta_minimo_32_caracteres
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

3. Teste o login com Google na página de login

---

## 🔧 Troubleshooting

### **Erro: "redirect_uri_mismatch"**
- Verifique se a URL de redirecionamento no Google Cloud Console está **exatamente** igual a:
  - `http://localhost:3000/api/auth/callback/google`
- Certifique-se de que não há espaços ou caracteres extras

### **Erro: "access_denied"**
- Verifique se você adicionou seu e-mail como usuário de teste na tela de consentimento
- Verifique se o projeto está no modo de teste (não publicado)

### **Erro: "invalid_client"**
- Verifique se o `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos no `.env`
- Certifique-se de que reiniciou o servidor após adicionar as variáveis

### **Não consigo ver o Client Secret novamente**
- Se você perdeu o secret, precisa criar uma nova credencial:
  1. Vá em "Credenciais"
  2. Clique na credencial existente
  3. Clique em "Adicionar chave" ou delete e crie uma nova

---

## 📝 Exemplo Completo do .env

```env
# Configurações do NextAuth
NEXTAUTH_SECRET=sua_string_secreta_aqui_minimo_32_caracteres_aleatorios
NEXTAUTH_URL=http://localhost:3000

# Configurações da API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
API_URL_SERVER=http://localhost:4000/api

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## 🌐 Para Produção

Quando fizer deploy (Vercel, Railway, etc.):

1. Adicione a URL de produção nas **URIs de redirecionamento autorizados**:
   ```
   https://seu-dominio.com/api/auth/callback/google
   ```

2. Configure as variáveis de ambiente na plataforma de deploy:
   - Vercel: Settings → Environment Variables
   - Railway: Variables
   - Outros: Consulte a documentação da plataforma

3. Atualize `NEXTAUTH_URL` para a URL de produção:
   ```env
   NEXTAUTH_URL=https://seu-dominio.com
   ```

---

## 📚 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [Documentação NextAuth.js](https://next-auth.js.org/providers/google)
- [Documentação Google OAuth](https://developers.google.com/identity/protocols/oauth2)

---

## ⚠️ Importante

- **Nunca** commite o arquivo `.env` no Git
- Mantenha suas credenciais seguras
- Use diferentes credenciais para desenvolvimento e produção
- O Client Secret é sensível - trate-o como uma senha

---

**Pronto!** Agora você tem tudo configurado para usar o login com Google no seu projeto! 🎉

