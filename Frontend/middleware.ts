import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// Rotas que requerem autenticação
const protectedRoutes = ['/dashboard', '/profile', '/settings']

// Rotas que só usuários não autenticados podem acessar
const authRoutes = ['/login', '/signup']

export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // Se usuário não está logado e tenta acessar rota protegida
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

// Configuração do matcher - define em quais rotas o middleware será executado
export const config = {
  matcher: [
    // Executa em todas as rotas exceto:
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
