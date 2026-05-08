import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Cliente Supabase para Server Components e Route Handlers
 * Usa cookies do request para restaurar sessão
 */
export async function createClientSupabase() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const createClient = createClientSupabase;

/**
 * Hook for Server Components to get user
 * Use in Server Components via:
 * const { data: { user } } = await supabase.auth.getUser();
 */
export type ServerSupabaseClient = ReturnType<typeof createClientSupabase>;
