'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import VillaLighting from './VillaLighting';
import CloudSystem from './CloudSystem';
import CameraController from './CameraController';
import ParticleField from '@/three/ParticleField';
import GlowOrb from '@/three/GlowOrb';
import FloatingHologram from '@/three/FloatingHologram';
import { COURSES, type Course } from '@/utils/courses';

interface FlyingVillaProps {
  isExploring: boolean;
  focusedTarget: {
    position: [number, number, number];
    lookAt: [number, number, number];
  } | null;
  onSelectCourse: (course: Course) => void;
  completedCourseIds: string[];
}

/* --- Villa floor (transparent reflective disc) --- */
function VillaFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <circleGeometry args={[25, 64]} />
      <meshStandardMaterial
        color="#080c20"
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* --- Central holographic hub structure --- */
function CentralHub() {
  return (
    <group position={[0, 0, 0]}>
      {/* Central pillar */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#2563EB"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Ring platform base */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.08, 8, 64]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Outer ring */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8, 0.05, 8, 128]} />
        <meshStandardMaterial
          color="#F5C451"
          emissive="#F5C451"
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function FlyingVilla({
  isExploring,
  focusedTarget,
  onSelectCourse,
  completedCourseIds,
}: FlyingVillaProps) {
  const orbPositions = useMemo(
    () =>
      [
        { pos: [-10, 4, -5] as [number, number, number], color: '#2563EB', size: 0.4 },
        { pos: [10, 3, -8] as [number, number, number], color: '#7C3AED', size: 0.35 },
        { pos: [-5, 6, 5] as [number, number, number], color: '#F5C451', size: 0.25 },
        { pos: [8, 5, 6] as [number, number, number], color: '#EC4899', size: 0.3 },
        { pos: [0, 8, -3] as [number, number, number], color: '#06B6D4', size: 0.2 },
        { pos: [-12, 2, 0] as [number, number, number], color: '#10B981', size: 0.3 },
        { pos: [12, 2, 0] as [number, number, number], color: '#EF4444', size: 0.25 },
      ] as const,
    []
  );

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{
          position: [0, 6, 18],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: '#050816' }}
      >
        <Suspense fallback={null}>
          {/* Camera */}
          <CameraController
            focusedTarget={focusedTarget}
            isExploring={isExploring}
          />

          {/* Lighting */}
          <VillaLighting />

          {/* Starfield background */}
          <Stars
            radius={100}
            depth={80}
            count={3000}
            factor={3}
            saturation={0.2}
            fade
            speed={0.5}
          />

          {/* Clouds below */}
          <CloudSystem />

          {/* Floor */}
          <VillaFloor />

          {/* Central hub structure */}
          <CentralHub />

          {/* Floating particles */}
          <ParticleField count={150} spread={30} color="#2563EB" size={0.04} />
          <ParticleField count={80} spread={25} color="#7C3AED" size={0.03} />
          <ParticleField count={40} spread={20} color="#F5C451" size={0.02} />

          {/* Decorative glow orbs */}
          {orbPositions.map((orb, i) => (
            <GlowOrb
              key={i}
              position={orb.pos}
              color={orb.color}
              size={orb.size}
              intensity={1.5}
              pulseSpeed={0.5 + i * 0.15}
            />
          ))}

          {/* Course Hologram Cards */}
          {COURSES.map((course) => (
            <FloatingHologram
              key={course.id}
              course={course}
              isCompleted={completedCourseIds.includes(course.id)}
              onClick={onSelectCourse}
            />
          ))}

          {/* Post-processing bloom for hologram glow */}
          <EffectComposer>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.6}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
