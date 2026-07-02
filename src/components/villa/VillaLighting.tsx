'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VillaLighting() {
  const spotRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (spotRef.current) {
      // Subtle color temperature shift
      const hue = 0.6 + Math.sin(time * 0.1) * 0.05; // Blue range
      spotRef.current.color.setHSL(hue, 0.7, 0.6);
    }
  });

  return (
    <>
      {/* Main ambient */}
      <ambientLight intensity={0.15} color="#1a1a3a" />

      {/* Key light — warm gold from above */}
      <directionalLight
        position={[5, 15, 5]}
        intensity={0.4}
        color="#F5C451"
        castShadow={false}
      />

      {/* Fill light — cool blue from side */}
      <directionalLight
        position={[-8, 8, -3]}
        intensity={0.2}
        color="#2563EB"
      />

      {/* Spotlight for dramatic center illumination */}
      <spotLight
        ref={spotRef}
        position={[0, 12, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.8}
        color="#3B82F6"
        distance={30}
        decay={2}
      />

      {/* Rim light — purple accent */}
      <pointLight
        position={[0, 5, -10]}
        intensity={1.5}
        color="#7C3AED"
        distance={20}
        decay={2}
      />

      {/* Warm accent lights */}
      <pointLight
        position={[-8, 3, 0]}
        intensity={0.8}
        color="#F5C451"
        distance={12}
        decay={2}
      />
      <pointLight
        position={[8, 3, 0]}
        intensity={0.8}
        color="#F5C451"
        distance={12}
        decay={2}
      />
    </>
  );
}
