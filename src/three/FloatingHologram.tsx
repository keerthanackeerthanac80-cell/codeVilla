'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Course } from '@/utils/courses';

interface FloatingHologramProps {
  course: Course;
  isCompleted?: boolean;
  onClick: (course: Course) => void;
}

export default function FloatingHologram({
  course,
  isCompleted = false,
  onClick,
}: FloatingHologramProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const initialY = useRef(course.position[1]);
  const phaseOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Floating movement
    groupRef.current.position.y =
      initialY.current + Math.sin(time * 0.8 + phaseOffset.current) * 0.3;

    // Slow rotation
    groupRef.current.rotation.y = Math.sin(time * 0.3 + phaseOffset.current) * 0.15;

    // Hover scale
    const targetScale = hovered ? 1.1 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
  });

  const handleClick = useCallback(() => {
    onClick(course);
  }, [course, onClick]);

  return (
    <group
      ref={groupRef}
      position={course.position}
    >
      {/* Hologram Card - using HTML overlay for rich text */}
      <Html
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <div
          onClick={handleClick}
          onMouseEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onMouseLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
          tabIndex={0}
          role="button"
          aria-label={`Open ${course.title} course`}
          className="relative w-48 transition-all duration-300"
          style={{
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {/* Card body */}
          <div
            className="rounded-2xl p-5 text-center backdrop-blur-md transition-all duration-300"
            style={{
              background: hovered
                ? `linear-gradient(135deg, rgba(${course.colorRgb}, 0.2) 0%, rgba(${course.colorRgb}, 0.08) 100%)`
                : `rgba(${course.colorRgb}, 0.08)`,
              border: `1px solid rgba(${course.colorRgb}, ${hovered ? 0.5 : 0.2})`,
              boxShadow: hovered
                ? `0 0 30px rgba(${course.colorRgb}, 0.3), 0 0 60px rgba(${course.colorRgb}, 0.1)`
                : `0 0 15px rgba(${course.colorRgb}, 0.1)`,
            }}
          >
            {/* Icon */}
            <div className="text-3xl mb-2">{course.icon}</div>

            {/* Title */}
            <h3
              className="font-bold text-sm mb-1 tracking-wide"
              style={{
                fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
                color: course.color,
                textShadow: `0 0 10px rgba(${course.colorRgb}, 0.5)`,
              }}
            >
              {course.shortTitle}
            </h3>

            {/* Difficulty */}
            <p
              className="text-[9px] uppercase tracking-[0.2em] mb-2"
              style={{ color: `rgba(${course.colorRgb}, 0.6)` }}
            >
              {course.difficulty}
            </p>

            {/* Duration */}
            <div
              className="text-[10px] opacity-50"
              style={{ color: course.color }}
            >
              {course.duration}
            </div>

            {/* Completion badge */}
            {isCompleted && (
              <div
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: 'linear-gradient(135deg, #F5C451, #D97706)',
                  boxShadow: '0 0 12px rgba(245, 196, 81, 0.5)',
                }}
              >
                ✓
              </div>
            )}
          </div>

          {/* Bottom glow line */}
          <div
            className="h-[1px] mx-4 mt-0 transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${course.colorRgb}, ${hovered ? 0.6 : 0.2}), transparent)`,
            }}
          />
        </div>
      </Html>

      {/* 3D point light for scene lighting */}
      <pointLight
        color={course.color}
        intensity={hovered ? 3 : 1}
        distance={6}
        decay={2}
      />
    </group>
  );
}
