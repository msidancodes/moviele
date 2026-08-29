import React, { useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Delete } from 'lucide-react';

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
];

export type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStatuses: Record<string, KeyStatus>;
}

export function Keyboard({ onKeyPress, keyStatuses }: KeyboardProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    const key = e.key.toUpperCase();
    if (key === 'ENTER') {
      onKeyPress('ENTER');
    } else if (key === 'BACKSPACE') {
      onKeyPress('BACKSPACE');
    } else if (/^[A-Z0-9]$/.test(key)) {
      onKeyPress(key);
    }
  }, [onKeyPress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getKeyClass = (key: string) => {
    const status = keyStatuses[key] || 'unused';
    return clsx(
      "flex items-center justify-center rounded uppercase font-bold text-sm select-none cursor-pointer transition-colors",
      "h-12 md:h-14 min-w-[2rem]",
      status === 'unused' && "bg-slate-700 text-white hover:bg-slate-600",
      status === 'absent' && "bg-slate-900 text-slate-500",
      status === 'present' && "bg-amber-500 text-white",
      status === 'correct' && "bg-emerald-500 text-white",
      (key === 'ENTER' || key === 'BACKSPACE') ? "px-2 md:px-4 text-xs" : "flex-1"
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 p-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 md:gap-2">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={getKeyClass(key)}
            >
              {key === 'BACKSPACE' ? <Delete size={20} /> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
