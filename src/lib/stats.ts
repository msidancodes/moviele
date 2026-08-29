export interface GameStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: number[];
}

const STATS_KEY = "moviele_stats";

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  return {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    bestStreak: 0,
    guessDistribution: new Array(10).fill(0), // Up to 10 attempts
  };
}

export function saveStats(stats: GameStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
}

export function updateStatsOnGameOver(isWin: boolean, numGuesses: number) {
  const stats = loadStats();
  stats.gamesPlayed += 1;
  
  if (isWin) {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
    // Record distribution (1-indexed array, so -1 for zero-indexed)
    if (numGuesses <= stats.guessDistribution.length) {
      stats.guessDistribution[numGuesses - 1] += 1;
    }
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(stats);
}
