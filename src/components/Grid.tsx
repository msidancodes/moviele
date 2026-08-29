import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { KeyStatus } from './Keyboard';

interface GridProps {
  guesses: string[];
  evaluations: KeyStatus[][];
  currentGuess: string;
  length: number;
  maxAttempts: number;
  isGameOver: boolean;
  invalidRowIndex?: number;
}

export function Grid({ guesses, evaluations, currentGuess, length, maxAttempts, isGameOver, invalidRowIndex }: GridProps) {
  const emptyRows = Math.max(0, maxAttempts - guesses.length - (isGameOver ? 0 : 1));
  
  return (
    <div className="flex flex-col gap-1.5 md:gap-2 items-center w-full px-2">
      {guesses.map((guess, i) => (
        <Row 
          key={i} 
          guess={guess} 
          evaluation={evaluations[i]} 
          length={length} 
          isRevealing={false} 
        />
      ))}
      
      {!isGameOver && (
        <Row 
          guess={currentGuess} 
          length={length} 
          isActive={true} 
          isInvalid={invalidRowIndex === guesses.length}
        />
      )}
      
      {Array.from({ length: emptyRows }).map((_, i) => (
        <Row key={`empty-${i}`} guess="" length={length} />
      ))}
    </div>
  );
}

interface RowProps {
  key?: React.Key;
  guess: string;
  evaluation?: KeyStatus[];
  length: number;
  isActive?: boolean;
  isRevealing?: boolean;
  isInvalid?: boolean;
}

function Row({ guess, evaluation, length, isActive, isInvalid }: RowProps) {
  const tiles = Array.from({ length });

  return (
    <motion.div 
      className="flex gap-1 md:gap-2 justify-center w-full max-w-full"
      animate={isInvalid ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      {tiles.map((_, i) => {
        const char = guess[i] || '';
        const status = evaluation ? evaluation[i] : null;
        
        return (
          <Tile key={i} char={char} status={status} delay={i * 0.1} isActive={isActive && char !== ''} />
        );
      })}
    </motion.div>
  );
}

interface TileProps {
  key?: React.Key;
  char: string;
  status: KeyStatus | null;
  delay: number;
  isActive?: boolean;
}

function Tile({ char, status, delay, isActive }: TileProps) {
  const isFilled = char !== '';
  
  return (
    <motion.div
      initial={{ rotateX: 0, scale: 1 }}
      animate={
        status 
          ? { rotateX: [0, 90, 0], backgroundColor: getStatusColor(status), borderColor: getStatusColor(status), color: '#fff' }
          : isActive ? { scale: [1, 1.1, 1] } : {}
      }
      transition={{ 
        rotateX: { duration: 0.5, delay },
        backgroundColor: { delay: delay + 0.25 },
        borderColor: { delay: delay + 0.25 },
        color: { delay: delay + 0.25 },
        scale: { duration: 0.1 }
      }}
      className={clsx(
        "flex items-center justify-center font-bold uppercase select-none",
        "w-full max-w-[2rem] sm:max-w-[2.5rem] md:max-w-[3rem] lg:max-w-[3.5rem] aspect-[4/5]",
        "text-base sm:text-xl md:text-2xl",
        "border-2 rounded-md transition-colors",
        !status && isFilled && "border-slate-500 text-slate-100",
        !status && !isFilled && "border-slate-800 text-transparent bg-slate-900",
      )}
      style={{
        backgroundColor: !status ? 'transparent' : undefined,
      }}
    >
      <span style={{ transform: status ? 'rotateX(0deg)' : 'none' }}>
        {char}
      </span>
    </motion.div>
  );
}

function getStatusColor(status: KeyStatus): string {
  switch (status) {
    case 'correct': return '#10b981'; // emerald-500
    case 'present': return '#f59e0b'; // amber-500
    case 'absent': return '#1e293b'; // slate-800
    default: return 'transparent';
  }
}
