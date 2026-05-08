'use client';

import { useState, useEffect, useCallback } from 'react';
import { RollingCounter } from './RollingCounter';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroTimerProps {
  className?: string;
  workMinutes?: number;
  breakMinutes?: number;
  initialMode?: 'work' | 'break';
  onComplete?: () => void;
}

export function PomodoroTimer({
  className,
  workMinutes = 25,
  breakMinutes = 5,
  initialMode = 'work',
  onComplete
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'break'>(initialMode);
  const [timeLeft, setTimeLeft] = useState(() =>
    initialMode === 'work' ? workMinutes * 60 : breakMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(false);

  const totalTime = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const newMode = mode === 'work' ? 'break' : 'work';
          setMode(newMode);
          const newTotal = newMode === 'work' ? workMinutes : breakMinutes;
          onComplete?.();
          return newTotal * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, mode, workMinutes, breakMinutes, onComplete]);

  const toggle = useCallback(() => setIsRunning(!isRunning), [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  }, [mode, workMinutes, breakMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-slate-100',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <RollingCounter
          value={minutes}
          fontSize={48}
          gap={4}
          textColor="hsl(var(--primary))"
          fontWeight={700}
          places={[10, 1]}
        />
        <span className="text-4xl font-bold text-slate-400">:</span>
        <RollingCounter
          value={seconds}
          fontSize={48}
          gap={4}
          textColor="hsl(var(--primary))"
          fontWeight={700}
          places={[10, 1]}
        />
      </div>
      <div className="text-sm text-slate-500 uppercase tracking-wider">
        {mode === 'work' ? 'Foco' : 'Pausa'}
      </div>
      <div className="flex gap-3">
        <button
          onClick={toggle}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors',
            isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          )}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={18} />
          Reiniciar
        </button>
      </div>
    </div>
  );
}