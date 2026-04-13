import { create } from 'zustand';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface GameState {
  user: any | null;
  sanity: number;
  isFlashlightOn: boolean;
  isGameOver: boolean;
  hasKey: boolean;
  tension: number;
  isPaused: boolean;
  jumpscareActive: string | null;
  inventory: string[];
  
  setUser: (user: any) => void;
  setPaused: (isPaused: boolean) => void;
  setSanity: (sanity: number) => void;
  toggleFlashlight: () => void;
  setGameOver: (isGameOver: boolean) => void;
  addInventory: (item: string) => void;
  increaseTension: (amount: number) => void;
  triggerJumpscare: (type: string | null) => void;
  resetGame: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: (uid: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  user: null,
  sanity: 100,
  isFlashlightOn: true,
  isGameOver: false,
  hasKey: false,
  tension: 0,
  isPaused: false,
  jumpscareActive: null,
  inventory: [],

  setUser: (user) => set({ user }),
  setPaused: (isPaused) => set({ isPaused }),
  setSanity: (sanity) => set({ sanity: Math.max(0, Math.min(100, sanity)) }),
  toggleFlashlight: () => set((state) => ({ isFlashlightOn: !state.isFlashlightOn })),
  setGameOver: (isGameOver) => set({ isGameOver }),
  addInventory: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  increaseTension: (amount) => set((state) => ({ tension: Math.min(100, state.tension + amount) })),
  triggerJumpscare: (type) => set({ jumpscareActive: type }),
  
  saveProgress: async () => {
    const { user, sanity, tension, inventory } = get();
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        sanity,
        tension,
        inventory,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  },

  loadProgress: async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          sanity: data.sanity ?? 100,
          tension: data.tension ?? 0,
          inventory: data.inventory ?? []
        });
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  },

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
