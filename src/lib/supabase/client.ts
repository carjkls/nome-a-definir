import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Type augmentation para TypeScript
export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nome: string;
          cnpj: string | null;
          segmento: string | null;
          setup_completo: boolean;
          plano: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          cnpj?: string | null;
          segmento?: string | null;
          setup_completo?: boolean;
          plano?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nome?: string;
          cnpj?: string | null;
          segmento?: string | null;
          setup_completo?: boolean;
          plano?: string;
          updated_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          nome: string;
          avatar_url: string | null;
          empresa_id: string | null;
          cargo: string | null;
          permissions: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          email: string;
          nome: string;
          avatar_url?: string | null;
          empresa_id?: string | null;
          cargo?: string | null;
          permissions?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          auth_id?: string;
          email?: string;
          nome?: string;
          avatar_url?: string | null;
          empresa_id?: string | null;
          cargo?: string | null;
          permissions?: Record<string, any>;
          updated_at?: string;
        };
      };
      clientes: {
        Row: {
          id: string;
          empresa_id: string;
          nome: string;
          email: string | null;
          telefone: string | null;
          cnpj_cpf: string | null;
          segmento: string | null;
          data_cadastro: string;
          observacoes: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          nome: string;
          email?: string | null;
          telefone?: string | null;
          cnpj_cpf?: string | null;
          segmento?: string | null;
          data_cadastro?: string;
          observacoes?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          empresa_id?: string;
          nome?: string;
          email?: string | null;
          telefone?: string | null;
          cnpj_cpf?: string | null;
          segmento?: string | null;
          data_cadastro?: string;
          observacoes?: string | null;
          metadata?: Record<string, any>;
          updated_at?: string;
        };
      };
      transacoes: {
        Row: {
          id: string;
          empresa_id: string;
          tipo: 'receita' | 'despesa';
          categoria: string;
          subcategoria: string | null;
          descricao: string;
          valor: number;
          data_emissao: string;
          data_vencimento: string;
          data_pagamento: string | null;
          status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
          cliente_id: string | null;
          comprovante_url: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          tipo: 'receita' | 'despesa';
          categoria: string;
          subcategoria?: string | null;
          descricao: string;
          valor: number;
          data_emissao: string;
          data_vencimento: string;
          data_pagamento?: string | null;
          status?: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
          cliente_id?: string | null;
          comprovante_url?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          empresa_id?: string;
          tipo?: 'receita' | 'despesa';
          categoria?: string;
          subcategoria?: string | null;
          descricao?: string;
          valor?: number;
          data_emissao?: string;
          data_vencimento?: string;
          data_pagamento?: string | null;
          status?: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
          cliente_id?: string | null;
          comprovante_url?: string | null;
          metadata?: Record<string, any>;
          updated_at?: string;
        };
      };
      scores_inadimplencia: {
        Row: {
          id: string;
          empresa_id: string;
          cliente_id: string;
          score: number;
          zona_risco: 'Seguro' | 'Alerta' | 'Critico';
          fatores: Record<string, any>;
          calculado_em: string;
          validado_em: string | null;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          cliente_id: string;
          score: number;
          zona_risco: 'Seguro' | 'Alerta' | 'Critico';
          fatores: Record<string, any>;
          calculado_em?: string;
          validado_em?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          empresa_id?: string;
          cliente_id?: string;
          score?: number;
          zona_risco?: 'Seguro' | 'Alerta' | 'Critico';
          fatores?: Record<string, any>;
          calculado_em?: string;
          validado_em?: string | null;
          metadata?: Record<string, any>;
        };
      };
      configuracoes: {
        Row: {
          id: string;
          empresa_id: string;
          regraCobrancaAutomatica: Record<string, any>;
          configNotificacoes: Record<string, any>;
          metaReservaEmergencia: number;
          scoreInadimplenciaParams: Record<string, any>;
          integracaoOpenFinanceAtiva: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          regraCobrancaAutomatica?: Record<string, any>;
          configNotificacoes?: Record<string, any>;
          metaReservaEmergencia?: number;
          scoreInadimplenciaParams?: Record<string, any>;
          integracaoOpenFinanceAtiva?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          empresa_id?: string;
          regraCobrancaAutomatica?: Record<string, any>;
          configNotificacoes?: Record<string, any>;
          metaReservaEmergencia?: number;
          scoreInadimplenciaParams?: Record<string, any>;
          integracaoOpenFinanceAtiva?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};
