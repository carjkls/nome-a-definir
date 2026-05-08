import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    ativo: 'bg-green-100 text-green-800',
    inativo: 'bg-gray-100 text-gray-800',
    pendente: 'bg-yellow-100 text-yellow-800',
    'em-reuniao': 'bg-blue-100 text-blue-800',
    offline: 'bg-slate-100 text-slate-800'
  };

  const defaultStyle = 'bg-gray-100 text-gray-800';
  // Normaliza status: remove acentos, lower case
  const normalized = status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const style = styles[normalized] || defaultStyle;

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', style, className)}>
      {status}
    </span>
  );
}
