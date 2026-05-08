import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock data: clients with overdue invoices
const mockClients = [
  {
    id: 'c1',
    name: 'Escola Primeiro Passo LTDA',
    email: 'financeiro@escolaprimeiro.com',
    phone: '11999887766',
    overdueAmount: 2850.00,
    invoiceNumber: 'INV-2025-0142',
    dueDate: '2025-04-15',
    daysOverdue: 18,
    score: 85,
    sector: 'Educação'
  },
  {
    id: 'c2',
    name: 'Clínica Saúde Plus',
    email: 'contato@saudeplus.com.br',
    phone: '11988776655',
    overdueAmount: 1200.00,
    invoiceNumber: 'INV-2025-0118',
    dueDate: '2025-04-20',
    daysOverdue: 13,
    score: 72,
    sector: 'Saúde'
  },
  {
    id: 'c3',
    name: 'Restaurante Sabor Caseiro',
    email: 'adm@saborcaseiro.com',
    phone: '11977665544',
    overdueAmount: 3450.50,
    invoiceNumber: 'INV-2025-0105',
    dueDate: '2025-04-01',
    daysOverdue: 32,
    score: 45,
    sector: 'Restaurante'
  },
  {
    id: 'c4',
    name: 'TechSolues Informática',
    email: 'financeiro@techsolucoes.com',
    phone: '11966554433',
    overdueAmount: 890.00,
    invoiceNumber: 'INV-2025-0136',
    dueDate: '2025-04-25',
    daysOverdue: 8,
    score: 68,
    sector: 'Tecnologia'
  },
  {
    id: 'c5',
    name: 'Academia Fitness Total',
    email: 'contato@fitnesstotal.com',
    phone: '11955443322',
    overdueAmount: 2100.00,
    invoiceNumber: 'INV-2025-0098',
    dueDate: '2025-03-30',
    daysOverdue: 34,
    score: 52,
    sector: 'Fitness'
  }
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Optional: filter by query params
  const { searchParams } = new URL('http://localhost:3000/area-colab/cobrancas');
  const minScore = searchParams.get('minScore');
  const maxDays = searchParams.get('maxDays');

  let filtered = mockClients;

  if (minScore) {
    filtered = filtered.filter(client => client.score >= parseInt(minScore));
  }

  if (maxDays) {
    filtered = filtered.filter(client => client.daysOverdue <= parseInt(maxDays));
  }

  return NextResponse.json(filtered);
}
