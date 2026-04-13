import { useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export function Environment() {
  // Simple house layout
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>

      {/* Walls - Main Hallway */}
      <Wall position={[0, 2, -15]} args={[30, 4, 0.5]} /> {/* North */}
      <Wall position={[0, 2, 15]} args={[30, 4, 0.5]} />  {/* South */}
      <Wall position={[-15, 2, 0]} args={[0.5, 4, 30]} /> {/* West */}
      <Wall position={[15, 2, 0]} args={[0.5, 4, 30]} />  {/* East */}

      {/* Internal Walls for a maze-like feel */}
      <Wall position={[0, 2, 0]} args={[0.5, 4, 10]} />
      <Wall position={[5, 2, -5]} args={[10, 4, 0.5]} />
      <Wall position={[-5, 2, 5]} args={[10, 4, 0.5]} />

      {/* The Exit Door */}
      <group position={[14.5, 1.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.2, 3, 2]} />
          <meshStandardMaterial color="#4a3728" roughness={0.5} />
        </mesh>
        <pointLight position={[-1, 1, 0]} intensity={0.5} color="#ff0000" distance={3} />
      </group>

      {/* Some "Furniture" */}
      <Box position={[-7, 0.5, -7]} args={[1, 1, 1]} color="#3d2b1f" />
      <Box position={[7, 0.5, 7]} args={[1.5, 1, 0.8]} color="#2b1f1a" />
      <Box position={[-8, 1, 2]} args={[0.5, 2, 0.5]} color="#1a1a1a" />

      {/* Ambient Light (very low) */}
      <ambientLight intensity={0.02} />
    </group>
  );
}

function Wall({ position, args }: { position: [number, number, number], args: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#222" roughness={0.9} />
    </mesh>
  );
}

function Box({ position, args, color }: { position: [number, number, number], args: [number, number, number], color: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}
