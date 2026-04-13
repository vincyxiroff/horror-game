import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../hooks/useGameStore';

export function JumpscareOverlay() {
  const jumpscareActive = useGameStore((state) => state.jumpscareActive);
  const triggerJumpscare = useGameStore((state) => state.triggerJumpscare);
  const [audio] = useState(new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')); // Placeholder loud sound

  useEffect(() => {
    if (jumpscareActive) {
      // Play scary sound
      const scream = new Audio('https://actions.google.com/sounds/v1/horror/horror_ghost_scream.ogg');
      scream.play().catch(() => {});
      
      const timer = setTimeout(() => {
        triggerJumpscare(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jumpscareActive, triggerJumpscare]);

  return (
    <AnimatePresence>
      {jumpscareActive === 'face' && (
        <motion.div
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <img
            src="https://picsum.photos/seed/horror_face/800/800?grayscale&blur=2"
            alt="Jumpscare"
            className="w-full h-full object-cover opacity-80 contrast-150"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay animate-pulse" />
        </motion.div>
      )}

      {jumpscareActive === 'glitch' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="fixed inset-0 z-[100] bg-white mix-blend-difference"
        />
      )}
    </AnimatePresence>
  );
}
