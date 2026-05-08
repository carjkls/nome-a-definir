'use client';

import { Calendar, Clock, Users, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingCardProps {
  title: string;
  date: string; // ISO string
  time: string; // HH:MM
  duration?: number; // minutes
  participants: string[]; // names
  agenda?: string;
  status: 'agendada' | 'em-andamento' | 'concluída' | 'cancelada';
  onJoin?: () => void;
  onReschedule?: () => void;
  className?: string;
}

export function MeetingCard({
  title,
  date,
  time,
  duration = 60,
  participants,
  agenda,
  status,
  onJoin,
  onReschedule,
  className
}: MeetingCardProps) {
  const statusColors: Record<string, string> = {
    agendada: 'bg-blue-100 text-blue-800',
    'em-andamento': 'bg-green-100 text-green-800',
    concluída: 'bg-gray-100 text-gray-800',
    cancelada: 'bg-red-100 text-red-800'
  };

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  // Calculate end time
  const [hours, mins] = time.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, mins + duration);
  const endTimeStr = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-sm border border-slate-100', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusColors[status] || 'bg-gray-100')}>
          {status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary-600" />
          <span>{formattedDate}</span>
          <Clock size={14} className="ml-2 text-primary-600" />
          <span>{time} - {endTimeStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-primary-600" />
          <span>{participants.length} participantes</span>
        </div>
      </div>

      {agenda && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          <span className="font-medium">Pauta:</span> {agenda}
        </p>
      )}

      <div className="flex gap-2">
        {status === 'agendada' && (
          <button
            onClick={onJoin}
            className="flex-1 py-2 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Video size={14} /> Entrar
          </button>
        )}
        {status === 'agendada' && (
          <button
            onClick={onReschedule}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Reagendar
          </button>
        )}
      </div>
    </div>
  );
}
