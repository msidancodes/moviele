/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './screens/Home';
import { Game } from './screens/Game';
import { HowToPlay } from './screens/HowToPlay';
import { Stats } from './screens/Stats';

type Screen = 'home' | 'daily' | 'random' | 'how-to-play' | 'stats';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const navigateHome = () => setCurrentScreen('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 flex flex-col">
      {currentScreen === 'home' && <Home onNavigate={setCurrentScreen} />}
      {currentScreen === 'daily' && <Game mode="daily" onBack={navigateHome} />}
      {currentScreen === 'random' && <Game mode="random" onBack={navigateHome} />}
      {currentScreen === 'how-to-play' && <HowToPlay onBack={navigateHome} />}
      {currentScreen === 'stats' && <Stats onBack={navigateHome} />}
    </div>
  );
}
