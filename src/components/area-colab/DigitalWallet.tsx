'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CreditCard, Wifi, ShieldCheck, ChevronUp } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardData {
  id: string;
  type: 'gold' | 'silver' | 'platinum';
  number: string;
  holder: string;
  expiry: string;
  balance: string;
}

interface DigitalWalletProps {
  balance?: string;
  bankName?: string;
  weeklyRevenue?: string;
  className?: string;
}

const MOCK_CARDS: CardData[] = [
  {
    id: '1',
    type: 'gold',
    number: '•••• •••• •••• 4289',
    holder: 'ALEXANDER HAMILTON',
    expiry: '09/28',
    balance: 'R$ 12.450,00'
  },
  {
    id: '2',
    type: 'silver',
    number: '•••• •••• •••• 8832',
    holder: 'ALEXANDER HAMILTON',
    expiry: '12/26',
    balance: 'R$ 4.200,50'
  }
];

export function DigitalWallet({
  balance = "R$ 45.902,89",
  bankName = "BTG Pactual",
  weeklyRevenue = "R$ 7.983,13",
  className
}: DigitalWalletProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isWalletHovered, setIsWalletHovered] = useState(false);

  const handleBackgroundClick = () => {
    setActiveCardId(null);
  };

  const currentBalance = activeCardId
    ? MOCK_CARDS.find(c => c.id === activeCardId)?.balance
    : balance;

  return (
    <div
      className={cn(
        'relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-primary-950',
        className
      )}
      onClick={handleBackgroundClick}
    >
      {/* Decorative ambient light */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(60,20,100,0.8)_0%,rgba(15,5,30,1)_70%)] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md perspective-1000">
        {/* Wallet Container */}
        <div
          className="relative w-80 h-56 md:w-96 md:h-64"
          onMouseEnter={() => setIsWalletHovered(true)}
          onMouseLeave={() => setIsWalletHovered(false)}
        >
          {/* Card Stack Area */}
          <div className="absolute inset-x-6 top-0 bottom-0 perspective-1000 transform-style-3d pointer-events-none">
            {MOCK_CARDS.map((card, index) => (
              <div key={card.id} className="pointer-events-auto">
                <Card
                  data={card}
                  index={index}
                  isActive={activeCardId === card.id}
                  isHovered={isWalletHovered}
                  onClick={() =>
                    setActiveCardId(activeCardId === card.id ? null : card.id)
                  }
                  totalCards={MOCK_CARDS.length}
                />
              </div>
            ))}
          </div>

          {/* The Physical Wallet (Front Pocket) */}
          <motion.div
            className="absolute inset-0 bg-[#141414] rounded-2xl shadow-[0_30px_60px_-10px_rgba(0,0,0,0.9)] border border-white/5 z-30 flex flex-col items-center justify-center text-center overflow-hidden"
            initial={false}
            animate={{
              rotateX: isWalletHovered || activeCardId ? 5 : 0,
              y: isWalletHovered ? 5 : 0
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Leather Texture */}
            <div className="absolute inset-0 opacity-60 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply" />
            {/* Subtle Gradient for volume */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            {/* Wallet Stitching */}
            <div className="absolute inset-3 border border-dashed border-white/10 rounded-xl opacity-50 pointer-events-none" />

            {/* BALANCE DISPLAY */}
            <div className="relative z-10 flex flex-col items-center space-y-2">
              <span className="text-primary-300 text-[10px] tracking-[0.25em] font-bold uppercase">
                Total Balance
              </span>
              <motion.div
                key={currentBalance}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl text-white font-serif tracking-tight font-medium"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
              >
                {currentBalance}
              </motion.div>
            </div>

            {/* Wallet Slot Visual */}
            <div className="absolute top-0 inset-x-8 h-1 bg-black/40 rounded-b-lg blur-[1px]" />
          </motion.div>

          {/* Wallet Back Layer (Depth) */}
          <motion.div
            className="absolute inset-0 bg-[#080808] rounded-2xl z-0 transform translate-y-3 translate-z-[-10px] scale-[0.98]"
          />
        </div>

        {/* Instruction Hint */}
        <motion.div
          className="text-primary-400/40 text-[10px] tracking-widest uppercase mt-12 flex items-center gap-2 font-medium"
          animate={{ opacity: isWalletHovered ? 1 : 0.5 }}
        >
          <ChevronUp size={10} className={isWalletHovered ? 'animate-bounce' : ''} />
          {activeCardId ? 'Clique fora para fechar' : 'Selecione um cartão'}
        </motion.div>
      </div>
    </div>
  );
}

function Card({
  data,
  index,
  isActive,
  isHovered,
  onClick,
  totalCards
}: {
  data: CardData;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  totalCards: number;
}) {
  const isGold = data.type === 'gold';

  const yOffset = isActive
    ? 55
    : isHovered
    ? -160 + index * 60
    : 0 + index * 15;

  const zIndex = isActive ? 40 : 10 + index;
  const scale = isActive ? 1.05 : 1 - (totalCards - 1 - index) * 0.05;
  const brightness = isActive ? 1 : isHovered ? 1 : 0.6 - (totalCards - 1 - index) * 0.1;
  const rotateX = isActive ? 0 : isHovered ? -5 : 0;

  return (
    <motion.div
      layout
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      initial={false}
      animate={{
        y: yOffset,
        scale: scale,
        zIndex: zIndex,
        rotateX: rotateX,
        filter: `brightness(${brightness})`
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      className={cn(
        'absolute left-0 w-full h-[200px] rounded-xl cursor-pointer shadow-xl overflow-hidden transform-gpu border border-white/10',
        isGold
          ? 'bg-gradient-to-br from-[#E6C685] via-[#A88B4D] to-[#6C5528]'
          : 'bg-gradient-to-br from-[#E2E2E2] via-[#9CA3AF] to-[#4B5563]'
      )}
      style={{
        transformStyle: 'preserve-3d',
        top: '-45px',
        transformOrigin: 'bottom center'
      }}
    >
      <div className="absolute inset-0 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-5 h-full flex flex-col justify-between font-mono text-shadow-sm select-none">
        <div className="flex justify-between items-start">
          <div className="w-10 h-7 rounded bg-black/10 border border-black/10 flex items-center justify-center backdrop-blur-sm">
            <div className="w-7 h-4 border border-black/20 rounded-sm" />
          </div>
          <Wifi className={cn('w-5 h-5 rotate-90 opacity-80', isGold ? 'text-[#3E2C0F]' : 'text-gray-800')} />
        </div>

        <div className="space-y-3">
          <div className={cn('text-lg tracking-widest font-bold font-mono', isGold ? 'text-[#3E2C0F]' : 'text-gray-900')}>
            {data.number}
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <div className={cn('text-[9px] uppercase opacity-70', isGold ? 'text-[#3E2C0F]' : 'text-gray-800')}>
                Card Holder
              </div>
              <div className={cn('text-xs font-bold tracking-wide uppercase', isGold ? 'text-[#3E2C0F]' : 'text-gray-900')}>
                {data.holder}
              </div>
            </div>
            <div className="space-y-0. text-right">
              <div className={cn('text-[9px] uppercase opacity-70', isGold ? 'text-[#3E2C0F]' : 'text-gray-800')}>
                Expires
              </div>
              <div className={cn('text-xs font-bold', isGold ? 'text-[#3E2C0F]' : 'text-gray-900')}>
                {data.expiry}
              </div>
            </div>
          </div>
        </div>

        <div className={cn('absolute top-5 right-5 flex items-center gap-1', isGold ? 'text-[#3E2C0F]' : 'text-gray-900')}>
          <div className="font-serif italic text-lg font-black tracking-tighter">Prestige</div>
          <Wifi className="w-3 h-3 rotate-90 opacity-60" />
        </div>
      </div>
    </motion.div>
  );
}

export default DigitalWallet;
