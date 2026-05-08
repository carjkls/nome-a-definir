'use client';

import { useEffect, useState } from 'react';
import { MeetingCard } from '@/components/area-colab/MeetingCard';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  agenda?: string;
  status: 'agendada' | 'em-andamento' | 'concluída' | 'cancelada';
}

export default function ReunioesPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const res = await fetch('/api/area-colab/reunioes');
      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMeeting = {
      title: formData.get('title'),
      date: formData.get('date'),
      time: formData.get('time'),
      duration: parseInt(formData.get('duration') as string) || 60,
      participants: (formData.get('participants') as string).split(',').map(s => s.trim()),
      agenda: formData.get('agenda'),
      status: 'agendada'
    };

    try {
      const res = await fetch('/api/area-colab/reunioes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      });
      if (res.ok) {
        await loadMeetings();
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reuniões</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : 'Agendar Nova Reunião'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input name="title" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input name="date" type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                <input name="time" type="time" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
              <input name="duration" type="number" defaultValue="60" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Participantes (separados por vírgula)</label>
              <input name="participants" required className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="João, Maria, Pedro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pauta</label>
              <textarea name="agenda" rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors">
              Criar Reunião
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-slate-500">Carregando reuniões...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              title={meeting.title}
              date={meeting.date}
              time={meeting.time}
              duration={meeting.duration}
              participants={meeting.participants}
              agenda={meeting.agenda}
              status={meeting.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
