import { useRef, useEffect, useState } from 'react';
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
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  const isFlashlightOn = useGameStore((state) => state.isFlashlightOn);
  const flashlightRef = useRef<THREE.SpotLight>(null!);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
        case 'KeyF':
          useGameStore.getState().toggleFlashlight();
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
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 4.0;
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();

    if (moveForward.current || moveBackward.current) velocity.current.z -= direction.current.z * speed * 10.0 * delta;
    if (moveLeft.current || moveRight.current) velocity.current.x -= direction.current.x * speed * 10.0 * delta;

    camera.translateX(-velocity.current.x * delta);
    camera.translateZ(-velocity.current.z * delta);
    
    // Keep player on the ground
    camera.position.y = 1.7;

    // Flashlight follows camera
    if (flashlightRef.current) {
      flashlightRef.current.position.copy(camera.position);
      flashlightRef.current.target.position.set(
        camera.position.x + Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x) * -10,
        camera.position.y + Math.sin(camera.rotation.x) * 10,
        camera.position.z + Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x) * -10
      );
      flashlightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <PointerLockControls />
      <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={75} />
      
      <spotLight
        ref={flashlightRef}
        castShadow
        intensity={isFlashlightOn ? 2 : 0}
        distance={15}
        angle={0.4}
        penumbra={0.5}
        decay={2}
        color="#fffbe0"
      />
      <primitive object={flashlightRef.current?.target || new THREE.Object3D()} />
    </>
  );
}
