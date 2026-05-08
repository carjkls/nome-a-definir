'use client';

import { StatusBadge } from './StatusBadge';
import { Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  status: string;
  lastSeen?: string;
  onProfileClick?: () => void;
  onAssignTask?: () => void;
  className?: string;
}

export function UserCard({
  name,
  role,
  email,
  phone,
  avatarUrl,
  status,
  lastSeen,
  onProfileClick,
  onAssignTask,
  className
}: UserCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-sm border border-slate-100', className)}>
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{name}</h3>
          <p className="text-sm text-slate-500 truncate">{role}</p>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
      {(email || phone) && (
        <div className="mt-3 space-y-1">
          {email && (
            <div className="flex items-center text-xs text-slate-500">
              <Mail size={12} className="mr-2" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center text-xs text-slate-500">
              <Phone size={12} className="mr-2" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onProfileClick}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Perfil
        </button>
        <button
          onClick={onAssignTask}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
        >
          Tarefa
        </button>
      </div>
      {lastSeen && <p className="mt-2 text-xs text-slate-400 text-right">Visto {lastSeen}</p>}
    </div>
  );
}