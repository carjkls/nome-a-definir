'use client';

import Image from 'next/image';
import { Calendar, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl?: string;
  sector: string;
  date: string;
  source: string;
  relevance?: number;
  onReadMore?: () => void;
  className?: string;
}

export function NewsCard({
  title,
  summary,
  imageUrl,
  sector,
  date,
  source,
  relevance,
  onReadMore,
  className
}: NewsCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100', className)}>
      {imageUrl && (
        <div className="relative h-40 w-full">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
            {sector}
          </span>
          {relevance !== undefined && (
            <span className="text-xs text-slate-500">
              Relevância: {Math.round(relevance * 100)}%
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-3 line-clamp-3">{summary}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
          </div>
          <span>{source}</span>
        </div>
        <button
          onClick={onReadMore}
          className="mt-3 w-full py-2 flex items-center justify-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium text-sm"
        >
          Ler mais <ExternalLink size={14} />
        </button>
      </div>
    </div>
  );
}
