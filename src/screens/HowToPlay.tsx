import React from 'react';
import { ArrowLeft } from 'lucide-react';

export function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto p-6 relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full transition-colors">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest text-emerald-500 mt-2">
        How to Play
      </h2>

      <div className="space-y-6 text-slate-300">
        <p>
          Guess the <strong>MOVIELE</strong> in the available attempts.
        </p>
        <p>
          The number of attempts is determined by the length of the movie title.
        </p>
        <p>
          Spaces and punctuation are removed. For example, "The Matrix" becomes <strong>THEMATRIX</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Each guess must be a valid movie title.</li>
          <li>Hit the enter button to submit.</li>
          <li>After each guess, the color of the tiles will change to show how close your guess was to the title.</li>
        </ul>

        <div className="border-t border-slate-800 pt-6 mt-6">
          <h3 className="font-bold text-white mb-4">Examples</h3>
          
          <div className="flex gap-1 mb-2">
            <div className="w-10 h-10 bg-emerald-500 text-white font-bold flex items-center justify-center rounded">T</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">I</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">T</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">A</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">N</div>
          </div>
          <p className="text-sm mb-6"><strong>T</strong> is in the movie title and in the correct spot.</p>

          <div className="flex gap-1 mb-2">
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">A</div>
            <div className="w-10 h-10 bg-amber-500 text-white font-bold flex items-center justify-center rounded">L</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">I</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">E</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">N</div>
          </div>
          <p className="text-sm mb-6"><strong>L</strong> is in the movie title but in the wrong spot.</p>

          <div className="flex gap-1 mb-2">
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">J</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">A</div>
            <div className="w-10 h-10 border-2 border-slate-700 font-bold flex items-center justify-center rounded">W</div>
            <div className="w-10 h-10 bg-slate-800 text-slate-500 font-bold flex items-center justify-center rounded">S</div>
          </div>
          <p className="text-sm"><strong>S</strong> is not in the movie title in any spot.</p>
        </div>
      </div>
    </div>
  );
}
