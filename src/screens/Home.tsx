import React from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, HelpCircle, BarChart2 } from 'lucide-react';

interface HomeProps {
  onNavigate: (screen: 'daily' | 'random' | 'how-to-play' | 'stats') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black tracking-tighter mb-2">
          MOVIE<span className="text-emerald-500">LE</span>
        </h1>
        <p className="text-slate-400 font-medium">Guess the movie title.</p>
      </motion.div>

      <div className="w-full flex flex-col gap-4">
        <button
          onClick={() => onNavigate('daily')}
          className="group relative flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold text-lg transition-all active:scale-95"
        >
          <Calendar size={24} />
          Daily Movie
          <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all pointer-events-none" />
        </button>

        <button
          onClick={() => onNavigate('random')}
          className="group relative flex items-center justify-center gap-3 w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold text-lg transition-all active:scale-95"
        >
          <Play size={24} />
          Random Movie
        </button>
      </div>

      <div className="flex items-center gap-4 mt-8 w-full">
        <button
          onClick={() => onNavigate('how-to-play')}
          className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
        >
          <HelpCircle size={24} />
          <span className="text-xs font-bold uppercase tracking-wider">How to Play</span>
        </button>
        <button
          onClick={() => onNavigate('stats')}
          className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
        >
          <BarChart2 size={24} />
          <span className="text-xs font-bold uppercase tracking-wider">Statistics</span>
        </button>
      </div>
    </div>
  );
}
