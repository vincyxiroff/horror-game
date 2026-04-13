import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, ContactShadows } from '@react-three/drei';
import { Player } from './Player';
import { Environment } from './Environment';
import { useGameStore } from '../hooks/useGameStore';
import { JumpscareOverlay } from './JumpscareOverlay';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import * as THREE from 'three';

function HorrorEntity() {
  const tension = useGameStore((state) => state.tension);
  const isPaused = useGameStore((state) => state.isPaused);
  const triggerJumpscare = useGameStore((state) => state.triggerJumpscare);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, -5]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.05 && tension > 30) {
        setVisible(true);
        // Random position near player
        setPosition([
          (Math.random() - 0.5) * 10,
          0,
          (Math.random() - 0.5) * 10
        ]);
        
        setTimeout(() => setVisible(false), 500);
      }

      // Random jumpscare trigger
      if (Math.random() < 0.01 && tension > 50) {
        const types = ['face', 'glitch'];
        triggerJumpscare(types[Math.floor(Math.random() * types.length)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tension, triggerJumpscare, isPaused]);

  if (!visible) return null;

  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 2, 0.5]} />
      <meshStandardMaterial color="black" transparent opacity={0.8} />
    </mesh>
  );
}

export default function Game() {
  const increaseTension = useGameStore((state) => state.increaseTension);
  const setSanity = useGameStore((state) => state.setSanity);
  const saveProgress = useGameStore((state) => state.saveProgress);
  const sanity = useGameStore((state) => state.sanity);
  const isPaused = useGameStore((state) => state.isPaused);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      increaseTension(1);
      if (sanity > 0) setSanity(sanity - 0.1);
    }, 2000);
    return () => clearInterval(interval);
  }, [increaseTension, setSanity, sanity, isPaused]);

  // Periodic Save
  useEffect(() => {
    if (isPaused) return;

    const saveInterval = setInterval(() => {
      saveProgress();
    }, 10000); // Save every 10 seconds
    return () => clearInterval(saveInterval);
  }, [saveProgress, isPaused]);

  return (
    <div className="w-full h-screen bg-black">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading Terror...</div>}>
        <Canvas shadows camera={{ fov: 75 }}>
          <fog attach="fog" args={['#000', 0, 15]} />
          <Player />
          <Environment />
          <HorrorEntity />
          <ContactShadows opacity={0.5} scale={10} blur={1} far={10} resolution={256} color="#000000" />
        </Canvas>
      </Suspense>
      <HUD />
      <PauseMenu />
      <JumpscareOverlay />
      
      {/* Audio Elements */}
      <audio autoPlay loop muted={isPaused} src="https://www.soundjay.com/nature/sounds/wind-howl-01.mp3" />
    </div>
  );
}
