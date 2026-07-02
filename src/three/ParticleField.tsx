'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  spread?: number;
  size?: number;
  color?: string;
  speed?: number;
}

export default function ParticleField({
  count = 200,
  spread = 20,
  size = 0.03,
  color = '#3B82F6',
  speed = 0.15,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * spread;
      pos[i3 + 1] = (Math.random() - 0.5) * spread;
      pos[i3 + 2] = (Math.random() - 0.5) * spread;

      vel[i3] = (Math.random() - 0.5) * speed * 0.01;
      vel[i3 + 1] = Math.random() * speed * 0.005 + 0.001;
      vel[i3 + 2] = (Math.random() - 0.5) * speed * 0.01;
    }

    return [pos, vel];
  }, [count, spread, speed]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * size + size * 0.5;
    }
    return s;
  }, [count, size]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3] + Math.sin(time * 0.5 + i) * 0.001;
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2] + Math.cos(time * 0.3 + i) * 0.001;

      // Wrap around bounds
      const halfSpread = spread / 2;
      if (posArray[i3 + 1] > halfSpread) posArray[i3 + 1] = -halfSpread;
      if (posArray[i3] > halfSpread) posArray[i3] = -halfSpread;
      if (posArray[i3] < -halfSpread) posArray[i3] = halfSpread;
      if (posArray[i3 + 2] > halfSpread) posArray[i3 + 2] = -halfSpread;
      if (posArray[i3 + 2] < -halfSpread) posArray[i3 + 2] = halfSpread;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
