import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../hooks/useGameStore';

export function Player() {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const isSprinting = useRef(false);
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const isPaused = useGameStore((state) => state.isPaused);
  const setPaused = useGameStore((state) => state.setPaused);
  const flashlightRef = useRef<THREE.SpotLight>(null!);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isPaused && event.code !== 'Escape') return;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          isSprinting.current = true;
          break;
        case 'KeyF':
          useGameStore.getState().toggleFlashlight();
          break;
        case 'Escape':
          setPaused(!isPaused);
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          isSprinting.current = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [isPaused, setPaused]);

  useFrame((state, delta) => {
    if (isPaused) return;

    const speed = isSprinting.current ? 6.0 : 3.0;
    const friction = 10.0;

    // Apply friction
    velocity.current.x -= velocity.current.x * friction * delta;
    velocity.current.z -= velocity.current.z * friction * delta;

    // Calculate direction
    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();

    // Apply acceleration
    if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * speed * friction * delta;
    if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * speed * friction * delta;

    // Move camera
    camera.translateX(-velocity.current.x * delta);
    camera.translateZ(-velocity.current.z * delta);
    
    // Fixed height
    camera.position.y = 1.7;

    // Head bobbing effect
    if (moveForward.current || moveBackward.current || moveLeft.current || moveRight.current) {
      const timer = state.clock.elapsedTime * (isSprinting.current ? 12 : 8);
      camera.position.y += Math.sin(timer) * 0.02;
    }

    // Flashlight logic
    if (flashlightRef.current) {
      flashlightRef.current.position.copy(camera.position);
      
      // Smooth target following
      const targetPos = new THREE.Vector3(0, 0, -1);
      targetPos.applyQuaternion(camera.quaternion);
      targetPos.add(camera.position);
      
      flashlightRef.current.target.position.lerp(targetPos, 0.2);
      flashlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      {!isPaused && <PointerLockControls />}
      <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={75} />
      
      <spotLight
        ref={flashlightRef}
        castShadow
        intensity={isFlashlightOn ? 2.5 : 0}
        distance={20}
        angle={0.35}
        penumbra={0.6}
        decay={2}
        color="#fffbe0"
      />
      <primitive object={flashlightRef.current?.target || new THREE.Object3D()} />
    </>
  );
}
