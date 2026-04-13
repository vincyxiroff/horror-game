import { create } from 'zustand';

interface GameState {
  sanity: number;
  isFlashlightOn: boolean;
  isGameOver: boolean;
  hasKey: boolean;
  tension: number;
  jumpscareActive: string | null;
  inventory: string[];
  
  setSanity: (sanity: number) => void;
  toggleFlashlight: () => void;
  setGameOver: (isGameOver: boolean) => void;
  addInventory: (item: string) => void;
  increaseTension: (amount: number) => void;
  triggerJumpscare: (type: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  sanity: 100,
  isFlashlightOn: true,
  isGameOver: false,
  hasKey: false,
  tension: 0,
  jumpscareActive: null,
  inventory: [],

  setSanity: (sanity) => set({ sanity: Math.max(0, Math.min(100, sanity)) }),
  toggleFlashlight: () => set((state) => ({ isFlashlightOn: !state.isFlashlightOn })),
  setGameOver: (isGameOver) => set({ isGameOver }),
  addInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  increaseTension: (amount) => set((state) => ({ tension: Math.min(100, state.tension + amount) })),
  triggerJumpscare: (type) => set({ jumpscareActive: type }),
  resetGame: () => set({
    sanity: 100,
    isFlashlightOn: true,
    isGameOver: false,
    hasKey: false,
    tension: 0,
    jumpscareActive: null,
    inventory: []
  }),
}));
