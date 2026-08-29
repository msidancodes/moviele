import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { loadStats, GameStats } from '../lib/stats';

export function Stats({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  if (!stats) return null;

  const winPercentage = stats.gamesPlayed === 0 ? 0 : Math.round((stats.wins / stats.gamesPlayed) * 100);
  const maxDistribution = Math.max(...stats.guessDistribution, 1); // Avoid div by zero

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto p-6 relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest text-emerald-500 mt-2">
        Statistics
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-10">
        <StatBox label="Played" value={stats.gamesPlayed} />
        <StatBox label="Win %" value={winPercentage} />
        <StatBox label="Current Streak" value={stats.currentStreak} />
        <StatBox label="Max Streak" value={stats.bestStreak} />
      </div>

      <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Guess Distribution</h3>
      <div className="flex flex-col gap-2 w-full">
        {stats.guessDistribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <div className="w-4 text-right">{i + 1}</div>
            <div className="flex-1 bg-slate-800 rounded h-6 overflow-hidden">
              <div 
                className="h-full bg-emerald-600 flex items-center justify-end pr-2 text-xs font-bold text-white"
                style={{ width: `${Math.max(5, (count / maxDistribution) * 100)}%` }}
              >
                {count > 0 && count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: number | string }) {
  return (
    <div className="flex flex-col items-center justify-center p-2 bg-slate-900 rounded-xl">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 text-center leading-tight mt-1">
        {label}
      </div>
    </div>
  );
}
