import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data: accounting offices
const mockOffices = [
  {
    id: 'e1',
    name: 'Contabilidade Silva & Associados',
    contact: 'João Silva',
    email: 'joao@contabilidadsilva.com.br',
    phone: '1133334444',
    clients: ['Escola Primeiro Passo LTDA', 'Clínica Saúde Plus'],
    status: 'ativo',
    services: ['Contabilidade Geral', 'Departamento Pessoal', ' Fiscal']
  },
  {
    id: 'e2',
    name: 'Assessoria Contábil Mendes',
    contact: 'Maria Mendes',
    email: 'maria@mendescontabil.com.br',
    phone: '1122223333',
    clients: ['Restaurante Sabor Caseiro', 'TechSolues Informática'],
    status: 'ativo',
    services: ['Contabilidade Geral', 'Auditoria', 'Consultoria Fiscal']
  },
  {
    id: 'e3',
    name: 'Escritório Costa Contábil',
    contact: 'Roberto Costa',
    email: 'roberto@costacontabil.com',
    phone: '1111112222',
    clients: ['Academia Fitness Total'],
    status: 'pendente',
    services: ['Contabilidade Geral']
  }
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockOffices);
}
