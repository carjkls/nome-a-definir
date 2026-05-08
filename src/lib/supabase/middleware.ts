import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/api/auth',
  '/api/webhook',
];

// Rotas da API que são públicas
const publicApiRoutes = [
  '/api/area-colab/risco-fuzzy', // nossa ferramenta de investimento
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const isPublicApi = publicApiRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se for público, permitir
  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }

  // Criar cliente Supabase no servidor para verificar sessão
  const supabase = await createClient();

  // Verificar se há sessão ativa
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Redirecionar para login se não autenticado
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar middleware nas rotas da área de colaboração e API, exceto as públicas
  matcher: [
    '/area-colab/:path*',
    '/api/:path*',
  ],
};
