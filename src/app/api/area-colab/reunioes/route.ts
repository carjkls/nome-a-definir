import { NextRequest, NextResponse } from 'next/server';

const mockMeetings = [
  {
    id: 'm1',
    title: 'Reuniao de fechamento comercial',
    date: '2026-05-04',
    time: '10:00',
    duration: 60,
    participants: ['Ana Ribeiro', 'Joao Vitor', 'Cliente Alfa'],
    agenda: 'Revisar contrato fechado, origem da venda e documentos para o contador.',
    status: 'agendada',
  },
  {
    id: 'm2',
    title: 'Call de caixa e investimentos',
    date: '2026-05-04',
    time: '14:30',
    duration: 45,
    participants: ['Rafael Financeiro', 'Helena Contadora'],
    agenda: 'Separar caixa operacional e materiais de leitura para alocacao.',
    status: 'agendada',
  },
  {
    id: 'm3',
    title: 'Resumo diario de gestores',
    date: '2026-05-03',
    time: '17:00',
    duration: 35,
    participants: ['Gerentes', 'Colaboradores chave'],
    agenda: 'Registrar decisoes, riscos e observacoes para envio contabil.',
    status: 'concluída',
  },
];

export async function GET() {
  return NextResponse.json(mockMeetings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newMeeting = {
      id: `m${Date.now()}`,
      title: body.title,
      date: body.date,
      time: body.time,
      duration: body.duration || 60,
      participants: body.participants || [],
      agenda: body.agenda || '',
      status: body.status || 'agendada',
    };

    mockMeetings.unshift(newMeeting);
    return NextResponse.json(newMeeting, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
