'use client';

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type UseAuthReturn = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null; data?: unknown }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: { nome?: string; avatar_url?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const UseAuthContext = createContext<UseAuthReturn | null>(null);

export function useAuth(): UseAuthReturn {
  const context = useContext(UseAuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome } },
    });
    return { error, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  const updateProfile = async (updates: { nome?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({ data: updates });
    if (error) throw error;
  };

  const refreshSession = async () => {
    const {
      data: { session: newSession },
    } = await supabase.auth.refreshSession();
    setSession(newSession);
    setUser(newSession?.user ?? null);
  };

  const value: UseAuthReturn = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
    refreshSession,
  };

  return <UseAuthContext.Provider value={value}>{children}</UseAuthContext.Provider>;
}
