import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Credentials Provider (login tradicional)
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          console.error('[NextAuth] Credenciais faltando: email ou senha não fornecidos')
          return null
        }

        try {
          // Chamada para sua API de login
          // Se estiver no servidor (Docker), usa a URL interna. Se não, usa a pública.
          let apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          
          // Garantir que a URL não termine com /api para evitar duplicação
          apiUrl = apiUrl.replace(/\/api$/, '');
          
          // Construir a URL completa do endpoint
          const loginUrl = `${apiUrl}/api/auth/login`
          
          console.log('[NextAuth] Tentando autenticar:', {
            email: credentials.email,
            apiUrl: loginUrl,
            baseUrl: apiUrl,
            isServer: !!process.env.API_URL_SERVER,
            envVars: {
              API_URL_SERVER: process.env.API_URL_SERVER || 'não definido',
              NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'não definido'
            }
          })

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              senha: credentials.senha,
            }),
          })

          if (!response.ok) {
            let errorData: any = {}
            try {
              const text = await response.text()
              errorData = text ? JSON.parse(text) : {}
            } catch (e) {
              console.error('[NextAuth] Erro ao fazer parse da resposta de erro:', e)
            }
            
            console.error('[NextAuth] Erro na resposta da API:', {
              status: response.status,
              statusText: response.statusText,
              url: loginUrl,
              error: errorData
            })
            
            // Lançar erro específico para que o NextAuth mostre mensagem melhor
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
          }

          const data = await response.json()
          console.log('[NextAuth] Resposta da API recebida:', {
            hasToken: !!data.token,
            hasUser: !!data.user,
            userId: data.user?.id
          })

          if (data.token && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.nome,
              role: data.user.role,
              accessToken: data.token,
              provider: 'credentials'
            }
          }

          console.error('[NextAuth] Resposta inválida: token ou user não encontrados')
          return null
        } catch (error) {
          console.error('[NextAuth] Erro na autenticação:', error)
          if (error instanceof Error) {
            console.error('[NextAuth] Detalhes do erro:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            })
            
            // Se for erro de rede (fetch failed), mostrar mensagem mais clara
            if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
              console.error('[NextAuth] Erro de conexão: Backend não está acessível. Verifique se o backend está rodando e a URL está correta.')
            }
          }
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Para login com Google OAuth
      if (account?.provider === "google") {
        try {
          // Verificar se usuário já existe ou criar novo
          let apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          
          // Garantir que a URL não termine com /api para evitar duplicação
          apiUrl = apiUrl.replace(/\/api$/, '');
          
          const response = await fetch(`${apiUrl}/api/auth/oauth-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              providerId: account.providerAccountId,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            // Adicionar informações do backend ao user
            user.id = data.user?.id // CUID correto do backend
            user.role = data.user?.role || 'FREE'
            user.accessToken = data.token
            user.provider = 'google'
            return true
          }
        } catch (error) {
          console.error('Erro no OAuth signin:', error)
        }
        return false
      }

      // Para login tradicional (credentials)
      return true
    },

    async jwt({ token, user, account }) {
      // Primeira vez que o usuário faz login
      if (user) {
        token.userId = user.id || token.sub || '' // Usar o ID correto do backend ou fallback
        token.accessToken = user.accessToken
        token.role = user.role || 'FREE'
        token.provider = user.provider || account?.provider || 'credentials'
      }
      return token
    },

    async session({ session, token }) {
      // Enviar propriedades para o cliente
      if (token) {
        session.user.id = token.userId as string || token.sub! // Usar o CUID correto
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 dias (mesmo que sua API)
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Tipos para TypeScript
declare module "next-auth" {
  interface User {
    role: string
    accessToken: string
    provider: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
    accessToken: string
    provider: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: string
    accessToken: string
    provider: string
  }
}
