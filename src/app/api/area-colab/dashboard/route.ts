import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simulando um pequeno delay para a animação do skeleton/loading caso exista
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({
    balance: 145000.50,
    bankName: "EscolaFlux Bank",
    weeklyRevenue: 12500.00,
    alerts: [
      { type: "info", message: "Notas do Dev: Nova integração do Algoritmo de fluxo ativa" },
      { type: "warning", message: "Notas do Dev: Backup do dashboard programado p/ 00h" }
    ],
    quickStats: {
      pendingInvoices: 5,
      overdueInvoices: 1,
      upcomingMeetings: 3
    }
  });
}
