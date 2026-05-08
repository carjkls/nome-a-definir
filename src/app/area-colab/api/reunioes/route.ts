import { NextRequest, NextResponse } from 'next/server';

// Mock data
const mockMeetings = [
  {
    id: 'm1',
    title: 'Reunião de Planejamento Trimestral',
    date: '2025-05-03',
    time: '10:00',
    duration: 60,
    participants: ['Ana Silva', 'Carlos Santos', 'Marina Costa'],
    agenda: 'Definição de metas para o próximo trimestre, análise de indicadores e priorização de projetos.',
    status: 'agendada'
  },
  {
    id: 'm2',
    title: 'Call com Cliente - Projeto X',
    date: '2025-05-03',
    time: '14:30',
    duration: 45,
    participants: ['Pedro Oliveira', 'Cliente Empresa Y'],
    agenda: 'Apresentação de protótipo e alinhamento de expectativas.',
    status: 'agendada'
  },
  {
    id: 'm3',
    title: 'Reunião Financeira Semanal',
    date: '2025-05-02',
    time: '09:00',
    duration: 50,
    participants: ['Lucia Mendes', 'Roberto Almeida'],
    agenda: 'Análise de fluxo de caixa e aprovação de despesas.',
    status: 'concluída'
  },
  {
    id: 'm4',
    title: 'Alinhamento de Equipe',
    date: '2025-05-01',
    time: '16:00',
    duration: 30,
    participants: ['Todos os colaboradores'],
    agenda: 'Comunicação de mudanças organizacionais e Celebração de conquistas.',
    status: 'cancelada'
  }
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(mockMeetings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, time, duration, participants, agenda, status } = body;

    // Basic validation
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: 'Title, date and time are required' },
        { status: 400 }
      );
    }

    // Create new meeting
    const newMeeting = {
      id: `m${Date.now()}`,
      title,
      date,
      time,
      duration: duration || 60,
      participants: participants || [],
      agenda: agenda || '',
      status: status || 'agendada'
    };

    // Add to mock data (in memory only)
    mockMeetings.push(newMeeting);

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
