import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../hooks/useGameStore';
import { Play, LogOut, Settings, Save } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function PauseMenu() {
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const saveProgress = useGameStore((state) => state.saveProgress);
  const setUser = useGameStore((state) => state.setUser);

  const handleResume = () => setPaused(false);
  
  const handleSave = async () => {
    await saveProgress();
    // Maybe show a "Saved" indicator
  };

  const handleQuit = async () => {
    await saveProgress();
    await signOut(auth);
    setUser(null);
    setPaused(false);
    window.location.reload(); // Simple way to reset state
  };

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-gray-900 border border-white/10 p-10 rounded-3xl shadow-2xl space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Paused</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">The shadows are waiting</p>
            </div>

            <div className="flex flex-col gap-3">
              <PauseButton onClick={handleResume} icon={<Play className="w-4 h-4 fill-current" />} label="Resume" primary />
              <PauseButton onClick={handleSave} icon={<Save className="w-4 h-4" />} label="Save Progress" />
              <PauseButton onClick={() => {}} icon={<Settings className="w-4 h-4" />} label="Settings" disabled />
              <div className="h-[1px] bg-white/5 my-2" />
              <PauseButton onClick={handleQuit} icon={<LogOut className="w-4 h-4" />} label="Quit to Menu" danger />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PauseButton({ onClick, icon, label, primary, danger, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-200
        ${primary ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-white/5 text-white hover:bg-white/10'}
        ${danger ? 'hover:bg-red-900/40 hover:text-red-400' : ''}
        ${disabled ? 'opacity-20 cursor-not-allowed' : ''}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
