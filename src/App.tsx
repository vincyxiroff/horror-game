/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Game from './components/Game';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Skull, Info } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <main className="w-full h-screen bg-black overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full text-white p-6 relative"
          >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img 
                src="https://picsum.photos/seed/abandoned_house/1920/1080?grayscale&blur=10" 
                alt="Background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="z-10 text-center space-y-8">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="space-y-2"
              >
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  Shadows
                </h1>
                <p className="text-sm tracking-[0.5em] uppercase opacity-50 font-mono">Of the Abandoned</p>
              </motion.div>

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setGameStarted(true)}
                  className="group relative flex items-center gap-3 px-12 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Enter the House
                  <div className="absolute -inset-1 border border-white/20 group-hover:border-red-600/50 transition-colors" />
                </button>
                
                <div className="flex gap-8 text-[10px] uppercase tracking-widest opacity-30 mt-8">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 border border-white/20 rounded">WASD</kbd>
                    <span>Move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 border border-white/20 rounded">MOUSE</kbd>
                    <span>Look</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 border border-white/20 rounded">F</kbd>
                    <span>Flashlight</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-help">
              <Info className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">Headphones Recommended</span>
            </div>

            <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-20">
              <Skull className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">Survival is not guaranteed</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full"
          >
            <Game />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
