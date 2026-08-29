import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, KeyStatus } from '../components/Keyboard';
import { Grid } from '../components/Grid';
import { Movie } from '../lib/movieService';
import { updateStatsOnGameOver } from '../lib/stats';
import confetti from 'canvas-confetti';
import { Share2, ArrowLeft } from 'lucide-react';

interface GameProps {
  mode: 'daily' | 'random';
  onBack: () => void;
}

interface GameState {
  gameId: string;
  length: number;
  maxAttempts: number;
}

export function Game({ mode, onBack }: GameProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<KeyStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [movieDetails, setMovieDetails] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalidRowIndex, setInvalidRowIndex] = useState<number | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Reset state
    setGuesses([]);
    setEvaluations([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setIsWin(false);
    setMovieDetails(null);
    setLoading(true);

    axios.get(`/api/movies/${mode}`)
      .then(res => {
        setGameState(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showToast("Failed to load game");
      });
  }, [mode]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleKeyPress = useCallback(async (key: string) => {
    if (isGameOver || !gameState || loading) return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== gameState.length) {
        setInvalidRowIndex(guesses.length);
        setTimeout(() => setInvalidRowIndex(undefined), 500);
        showToast("Not enough letters");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post('/api/game/guess', {
          gameId: gameState.gameId,
          mode,
          guess: currentGuess
        });

        if (res.data.status === 'invalid_word') {
          setInvalidRowIndex(guesses.length);
          setTimeout(() => setInvalidRowIndex(undefined), 500);
          showToast("Not a recognized movie title");
          setLoading(false);
          return;
        }

        if (res.data.status === 'valid') {
          const newGuesses = [...guesses, currentGuess];
          const newEvaluations = [...evaluations, res.data.evaluation];
          setGuesses(newGuesses);
          setEvaluations(newEvaluations);
          setCurrentGuess('');

          if (res.data.isWin) {
            setIsWin(true);
            setIsGameOver(true);
            setMovieDetails(res.data.movieDetails);
            updateStatsOnGameOver(true, newGuesses.length);
            setTimeout(() => {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#f59e0b', '#ffffff']
              });
            }, 1000);
          } else if (newGuesses.length >= gameState.maxAttempts) {
            setIsGameOver(true);
            updateStatsOnGameOver(false, newGuesses.length);
            // Fetch reveal
            const revealRes = await axios.post('/api/game/reveal', {
              gameId: gameState.gameId,
              mode
            });
            setMovieDetails(revealRes.data.movieDetails);
          }
        }
      } catch (err) {
        console.error(err);
        showToast("Error validating guess");
      }
      setLoading(false);
      return;
    }

    if (currentGuess.length < gameState.length) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameState, guesses, evaluations, isGameOver, loading, mode]);

  // Derive keyboard statuses
  const keyStatuses: Record<string, KeyStatus> = {};
  guesses.forEach((guess, i) => {
    const evaluation = evaluations[i];
    for (let j = 0; j < guess.length; j++) {
      const letter = guess[j];
      const status = evaluation[j];
      const current = keyStatuses[letter];
      if (current === 'correct') continue;
      if (current === 'present' && status === 'absent') continue;
      keyStatuses[letter] = status;
    }
  });

  const handleShare = async () => {
    if (!gameState) return;
    const title = mode === 'daily' ? `Moviele Daily` : `Moviele Random`;
    const score = isWin ? guesses.length : 'X';
    let grid = evaluations.map(row => 
      row.map(s => s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛').join('')
    ).join('\n');
    
    const text = `${title} - ${score}/${gameState.maxAttempts}\n\n${grid}`;
    
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
      }
    } catch (e) {
      console.error(e);
      showToast("Could not share");
    }
  };

  if (!gameState && loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-5xl mx-auto h-full relative pt-4 pb-2">
      <div className="flex items-center justify-between px-4 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-500">
          {mode} mode
        </h2>
        <div className="w-10"></div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-100 text-slate-900 px-4 py-2 rounded font-bold shadow-lg"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center mb-4">
        {gameState && (
          <Grid
            guesses={guesses}
            evaluations={evaluations}
            currentGuess={currentGuess}
            length={gameState.length}
            maxAttempts={gameState.maxAttempts}
            isGameOver={isGameOver}
            invalidRowIndex={invalidRowIndex}
          />
        )}
      </div>

      <div className="w-full">
        <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
      </div>

      <AnimatePresence>
        {isGameOver && movieDetails && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4">
              <h2 className="text-3xl font-black text-center mb-2 text-white">
                {isWin ? "Cinematic!" : "Cut!"}
              </h2>
              
              <div className="flex gap-4">
                {movieDetails.posterPath ? (
                  <img src={movieDetails.posterPath} alt="Poster" className="w-1/3 rounded-lg object-cover shadow-lg" />
                ) : (
                  <div className="w-1/3 aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">No Poster</div>
                )}
                
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold leading-tight">{movieDetails.title}</h3>
                  <div className="text-slate-400 text-sm mt-1">{movieDetails.year} • {movieDetails.language}</div>
                  <div className="flex items-center gap-1 mt-2 text-amber-400 font-bold">
                    ★ {movieDetails.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm italic border-l-2 border-emerald-500 pl-3">
                {movieDetails.overview.substring(0, 120)}...
              </p>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  <Share2 size={20} /> Share
                </button>
                <button 
                  onClick={onBack}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
