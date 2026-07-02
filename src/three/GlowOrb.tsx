'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlowOrbProps {
  position: [number, number, number];
  color?: string;
  size?: number;
  intensity?: number;
  pulseSpeed?: number;
}

export default function GlowOrb({
  position,
  color = '#2563EB',
  size = 0.3,
  intensity = 2,
  pulseSpeed = 1,
}: GlowOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      const scale = 1 + Math.sin(time * pulseSpeed) * 0.15;
      meshRef.current.scale.setScalar(scale);
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (1 + Math.sin(time * pulseSpeed) * 0.3);
    }
  });

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size * 0.3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        distance={8}
        decay={2}
      />
    </group>
  );
}
