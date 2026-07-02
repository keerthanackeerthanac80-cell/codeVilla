'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CloudSystem() {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      key: i,
      position: [
        (Math.random() - 0.5) * 60,
        -8 + Math.random() * 4,
        (Math.random() - 0.5) * 60,
      ] as [number, number, number],
      scale: Math.random() * 3 + 2,
      speed: Math.random() * 0.02 + 0.005,
      opacity: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    const time = state.clock.elapsedTime;

    children.forEach((child, i) => {
      const cloud = clouds[i];
      if (!cloud) return;
      // Drift slowly
      child.position.x = cloud.position[0] + Math.sin(time * cloud.speed) * 5;
      child.position.z = cloud.position[2] + Math.cos(time * cloud.speed * 0.7) * 3;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((cloud) => (
        <mesh key={cloud.key} position={cloud.position}>
          <planeGeometry args={[cloud.scale * 4, cloud.scale * 2]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={cloud.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
