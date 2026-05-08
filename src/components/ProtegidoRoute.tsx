'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtegidoRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Componente para proteger rotas no lado do cliente
 * Se o usuário não estiver autenticado, redireciona para login
 * Pode opcionalmente mostrar loading enquanto verifica auth
 */
export function ProtegidoRoute({ children, redirectTo = '/login' }: ProtegidoRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // ou algum placeholder se preferir
  }

  return <>{children}</>;
}
