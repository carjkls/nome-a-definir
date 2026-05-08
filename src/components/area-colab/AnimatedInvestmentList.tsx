'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode, type UIEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentItem {
  id: string;
  name: string;
  bank: string;
  type: string;
  performanceIndex: number;
  rate: string;
  amount: number;
  risk: string;
  note: string;
}

interface AnimatedInvestmentListProps {
  items: InvestmentItem[];
}

function AnimatedItem({ children, index, onClick, onMouseEnter }: {
  children: ReactNode;
  index: number;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      initial={{ scale: 0.72, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.72, opacity: 0 }}
      transition={{ duration: 0.2, delay: 0.06 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export function AnimatedInvestmentList({ items }: AnimatedInvestmentListProps) {
  const sortedItems = [...items].sort((a, b) => a.performanceIndex - b.performanceIndex);
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  const selectItem = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((previous) => Math.min(previous + 1, sortedItems.length - 1));
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((previous) => Math.max(previous - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedItems.length]);

  useEffect(() => {
    if (!keyboardNav || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (!selectedItem) return;

    const extraMargin = 48;
    const itemTop = selectedItem.offsetTop;
    const itemBottom = itemTop + selectedItem.offsetHeight;
    if (itemTop < container.scrollTop + extraMargin) {
      container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
    } else if (itemBottom > container.scrollTop + container.clientHeight - extraMargin) {
      container.scrollTo({ top: itemBottom - container.clientHeight + extraMargin, behavior: 'smooth' });
    }
    setKeyboardNav(false);
  }, [keyboardNav, selectedIndex]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#060010] shadow-2xl">
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="max-h-[520px] overflow-y-auto p-4 thin-dark-scrollbar"
      >
        {sortedItems.map((item, index) => (
          <AnimatedItem
            key={item.id}
            index={index}
            onClick={() => selectItem(index)}
            onMouseEnter={() => selectItem(index)}
          >
            <div
              className={cn(
                'grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl border p-4 transition-all duration-200',
                selectedIndex === index
                  ? 'border-white/20 bg-white/10 shadow-[0_18px_40px_rgba(106,72,242,0.18)]'
                  : 'border-white/5 bg-[#111] hover:bg-[#171717]'
              )}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="m-0 text-sm font-semibold text-white">{item.name}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white/50">
                    {item.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">{item.bank} · {item.rate} · {item.risk}</p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{item.note}</p>
              </div>
              <div className="flex min-w-[136px] items-center justify-end gap-3">
                <div className="text-right">
                  <p className="m-0 font-mono text-2xl font-bold text-[#bef264]">{item.performanceIndex.toFixed(1)}</p>
                  <p className="m-0 text-[10px] uppercase tracking-widest text-white/40">indice</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/35" />
              </div>
            </div>
          </AnimatedItem>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent transition-opacity duration-300" style={{ opacity: topGradientOpacity }} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent transition-opacity duration-300" style={{ opacity: bottomGradientOpacity }} />
    </div>
  );
}
